import mongoose from "mongoose";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

import Feed from "../models/Feed";
import User from "../models/User";
import Location from "../models/Location";
import Image from "../models/Image";
import connectRedis from "../utils/redis";

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

    // TODO: update top 10 liked, 10 viewed feeds which around each airport in redis
  };

  detailFeed = async (feedId: string, clientIP: string) => {
    let feed;

    // FIXME: 빈 배열인 경우 populate를 걸면 에러가 뜨는 듯함(comments, subComments)
    // TODO: wrtier field should contain profile img
    try {
      // reference : how to select specific field with populate
      // https://mongoosejs.com/docs/populate.html#field-selection
      // https://mongoosejs.com/docs/populate.html#populating-multiple-paths
      feed = await Feed.findById(feedId)
        .populate("location", "address lat lng")
        .populate("writer", "_id nickname")
        .populate("images", "path")
        .populate({
          path: "comments",
          select: "-feed",
          options: {
            // reference : how to sort data
            // https://mongoosejs.com/docs/api/query.html#Query.prototype.sort()
            sort: { createdAt: "descending" },
          },
          // reference : how to populate multiple depths document
          // https://mongoosejs.com/docs/populate.html#deep-populate
          // https://stackoverflow.com/questions/51724786/how-to-populate-in-3-collection-in-mongodb-with-mongoose
          populate: [
            { path: "writer", select: "_id nickname" },
            {
              path: "subComments",
              select: "-feed",
              options: {
                sort: { createdAt: "descending" },
              },
              populate: { path: "writer", select: "_id nickname" },
            },
          ],
        });
    } catch (err) {
      console.log(err);
      throw new Error("게시물 탐색 실패");
    }

    // reference : how to implement increment of view count
    // https://dont-think-about-too-much.github.io/2021/06/28/0writeback/
    // https://velog.io/@bagt/Spring-Scheduler%EB%A1%9C-%EC%A1%B0%ED%9A%8C%EC%88%98-%EB%A1%9C%EC%A7%81-%EC%BA%90%EC%8B%B1-%EA%B5%AC%ED%98%84%ED%95%98%EA%B8%B0
    const redisClient = await connectRedis();

    try {
      // expire condition : Date.now() of req >= (Date.now() when caching data + 24hour)
      await redisClient.zRemRangeByScore(feedId, -Infinity, Date.now());
    } catch (err) {
      await redisClient.disconnect();
      throw new Error("조회수 어뷰징 차단용 IP 캐싱 만료 처리 실패");
    }

    let isAbusingCached: boolean;

    try {
      isAbusingCached = (await redisClient.zScan(feedId, 0)).members.some(
        (member) => member.value === clientIP
      );
    } catch (err) {
      await redisClient.disconnect();
      throw new Error("조회수 어뷰징 차단용 IP 캐싱 탐색 실패");
    }

    if (isAbusingCached) {
      await redisClient.disconnect();
      return feed;
    }

    // reference : how to implement expiration of value using Sorted-Set in redis
    // https://stackoverflow.com/questions/7577923/redis-possible-to-expire-an-element-in-an-array-or-sorted-set
    // https://copyprogramming.com/howto/redis-expire-set-element#google_vignette
    // https://groups.google.com/g/redis-db/c/-GSVYNoPfYI
    const expirationTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hour

    try {
      // reference : how to use "zAdd"
      // https://stackoverflow.com/questions/70122516/redis-add-to-sorted-set-using-typescript
      await redisClient.zAdd(feedId, {
        score: expirationTime,
        value: clientIP,
      });
    } catch (err) {
      await redisClient.disconnect();
      throw new Error("조회수 어뷰징 차단용 IP 캐싱 실패");
    }

    try {
      await redisClient.hIncrBy("viewCounts", feedId, 1);
    } catch (err) {
      await redisClient.disconnect();
      throw new Error("조회수 캐싱 실패");
    }

    await redisClient.disconnect();

    return feed;
  };
}

export default FeedService;
