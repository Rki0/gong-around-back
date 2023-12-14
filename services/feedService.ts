import mongoose from "mongoose";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

import Feed from "../models/Feed";
import User from "../models/User";
import Location from "../models/Location";
import Image from "../models/Image";

interface FeedLocation {
  address: string;
  lat: number;
  lng: number;
}

// reference
// https://stackoverflow.com/questions/57631753/how-to-properly-handle-req-files-in-node-post-request-using-multer-and-typescrip
// https://devdojo.com/noah071610/typescript-multer-error-property-location-does-not-exist-on-type-file
interface FeedData {
  title: string;
  date: string;
  location: FeedLocation;
  description: string;
  images: Express.MulterS3.File[];
}

class FeedService {
  pagination = async (page: number, keyword: string | undefined) => {
    const FEEDS_PER_PAGE = 10;
    const PAGINATION_AT_ONCE = 10;

    let numberOfFeeds;

    try {
      if (!keyword) {
        // reference
        // https://mongoosejs.com/docs/api/model.html#Model.estimatedDocumentCount()
        numberOfFeeds = await Feed.estimatedDocumentCount();
      } else {
        // reference
        // https://stackoverflow.com/questions/65160433/mongodb-mongoose-whats-the-best-way-to-count-a-lot-of-documents-with-a-filter
        // https://stackoverflow.com/questions/73833749/in-mongodb-how-do-we-apply-filter-criteria-on-a-subdocument
        numberOfFeeds = await Feed.countDocuments({
          title: { $regex: keyword, $options: "i" },
        });
      }
    } catch (err) {
      console.log(err);
      throw new Error("게시물 개수 파악 실패");
    }

    const totalPageNum = Math.ceil(numberOfFeeds / FEEDS_PER_PAGE);

    const paginationStartNum =
      Math.floor(page / PAGINATION_AT_ONCE) * PAGINATION_AT_ONCE + 1;
    const paginationEndNum =
      Math.ceil(page / PAGINATION_AT_ONCE) * PAGINATION_AT_ONCE >= totalPageNum
        ? totalPageNum
        : Math.ceil(page / PAGINATION_AT_ONCE) * PAGINATION_AT_ONCE;

    let currentPageFeeds;

    // reference
    // https://www.mongodb.com/docs/v7.0/reference/operator/aggregation/project/
    // https://www.mongodb.com/docs/manual/reference/operator/query/regex/
    // https://www.mongodb.com/docs/v7.0/reference/operator/aggregation/match/
    try {
      if (!keyword) {
        currentPageFeeds = await Feed.aggregate([
          {
            $project: {
              title: true,
              description: true,
              createdAt: true,
              like: true,
              view: true,
              commentsCount: { $size: "$comments" },
              subCommentsCount: { $size: "$subComments" },
            },
          },
        ])
          .skip((page - 1) * FEEDS_PER_PAGE) // skip data which aren't related with current page
          .limit(FEEDS_PER_PAGE); // control number of the data
      } else {
        currentPageFeeds = await Feed.aggregate([
          {
            $match: {
              title: { $regex: keyword, $options: "i" },
            },
          },
          {
            $project: {
              title: true,
              description: true,
              createdAt: true,
              like: true,
              view: true,
              commentsCount: { $size: "$comments" },
              subCommentsCount: { $size: "$subComments" },
            },
          },
        ])
          .skip((page - 1) * FEEDS_PER_PAGE)
          .limit(FEEDS_PER_PAGE);
      }
    } catch (err) {
      console.log(err);
      throw new Error("게시물 추출 실패");
    }

    const hasMore = totalPageNum !== page;

    return {
      currentPageFeeds,
      totalPageNum,
      paginationStartNum,
      paginationEndNum,
      hasMore,
    };
  };

  createFeed = async (userId: string, feedData: FeedData) => {
    let existingUser;

    try {
      existingUser = await User.findById(userId);
    } catch (err) {
      throw new Error("유저 정보를 찾을 수 없습니다.");
    }

    if (!existingUser) {
      throw new Error("존재하지 않는 유저입니다.");
    }

    // reference
    // https://mongoosejs.com/docs/populate.html
    await existingUser.populate("writedFeeds");

    const { images, location, ...feedDataExceptRef } = feedData;

    // how to create inter-ref model at the same time
    const locationId = new mongoose.Types.ObjectId();
    const feedId = new mongoose.Types.ObjectId();
    const imagesId = images.map(() => new mongoose.Types.ObjectId());

    // reference
    // https://blogdeveloperspot.blogspot.com/2019/01/aws-s3-url-location-url.html
    const createdImages = images.map(
      (image, index) =>
        new Image({
          _id: imagesId[index],
          writer: userId,
          feed: feedId,
          path: decodeURI(image.location),
          name: image.originalname,
        })
    );

    const createdLocation = new Location({
      ...location,
      _id: locationId,
      feed: feedId,
      writer: userId,
    });

    const createdFeed = new Feed({
      ...feedDataExceptRef,
      _id: feedId,
      location: locationId,
      writer: userId,
      images: createdImages,
    });

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // SUGGEST: how about "insertMany"?
      await Promise.all(
        createdImages.map(async (createdImage) => {
          await createdImage.save({ session });
        })
      );
      await createdLocation.save({ session });
      await createdFeed.save({ session });

      existingUser.writedFeeds.push(feedId);
      await existingUser.save({ session });

      await session.commitTransaction();
    } catch (err) {
      console.log(err);

      const s3 = new S3Client({
        region: process.env.AWS_REGION,
      });

      try {
        await Promise.all(
          images.map(
            async (image) =>
              await s3.send(
                new DeleteObjectCommand({
                  Bucket: process.env.AWS_S3_BUCKET_NAME!,
                  Key: image.key,
                })
              )
          )
        );
      } catch (err) {
        console.log("S3 이미지 삭제 실패:", err);
        throw new Error("S3 이미지 삭제 실패");
      }

      await session.abortTransaction();
      await session.endSession();
      throw new Error("게시물 생성 세션 실패");
    }

    await session.endSession();

    // TODO: update top 10 liked feeds which around each airport in redis(no need )
  };
}

export default FeedService;
