import mongoose from "mongoose";

import Feed from "../models/Feed";
import Location from "../models/Location";
import Image from "../models/Image";
import connectRedis from "../utils/redis";
import UserDB from "../common/userDB";
import FeedDB from "../common/feedDB";
import SubComment from "../models/SubComment";
import Comment from "../models/Comment";
import S3Module from "../common/s3Module";
import CustomError from "../errors/customError";

import { Feed as FeedData } from "../types/feed";

class FeedService {
  pagination = async (page: number, keyword: string | undefined) => {
    const FEEDS_PER_PAGE = 10;
    const PAGINATION_AT_ONCE = 10;

    let numberOfFeeds;

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
    await UserDB.getById(userId);

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
          name: image.originalname,
          path: decodeURI(image.location),
          key: image.key,
        })
    );

    const createdLocation = new Location({
      _id: locationId,
      feed: feedId,
      writer: userId,
      address: location.address,
      location: {
        type: "Point",
        coordinates: [location.lng, location.lat],
      },
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

      await session.commitTransaction();
    } catch (err) {
      console.log(err);

      const s3 = S3Module.openClient();

      await S3Module.deleteMany(s3, images);

      await session.abortTransaction();

      throw new CustomError(500, "게시물 생성 세션 실패");
    } finally {
      await session.endSession();
    }

    // TODO: update top 10 liked, 10 viewed feeds which around each airport in redis
  };

  deleteFeed = async (userId: string, feedId: string) => {
    const existingUser = await UserDB.getById(userId);

    const session = await mongoose.startSession();
    const redisClient = await connectRedis();

    try {
      session.startTransaction();

      await SubComment.deleteMany({ feed: feedId }).session(session);
      await Comment.deleteMany({ feed: feedId }).session(session);
      await Location.deleteOne({ feed: feedId }).session(session);

      const s3 = S3Module.openClient();

      const images = await Image.find({ writer: existingUser._id });

      await S3Module.deleteMany(s3, images);

      s3.destroy();

      await Image.deleteMany({ feed: feedId }).session(session);
      await Feed.findByIdAndDelete(feedId).session(session);

      await redisClient.del(feedId);
      await redisClient.hDel("viewCounts", feedId);

      await session.commitTransaction();
    } catch (err) {
      session.abortTransaction();
      throw new CustomError(500, "게시물 삭제 세션 실패");
    } finally {
      await redisClient.disconnect();
      await session.endSession();
    }
  };

  detailFeed = async (feedId: string, clientIP: string) => {
    // reference : how to select specific field with populate
    // https://mongoosejs.com/docs/populate.html#field-selection
    // https://mongoosejs.com/docs/populate.html#populating-multiple-paths
    const feed = await Feed.findById(feedId)
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

    // reference : how to implement increment of view count
    // https://dont-think-about-too-much.github.io/2021/06/28/0writeback/
    // https://velog.io/@bagt/Spring-Scheduler%EB%A1%9C-%EC%A1%B0%ED%9A%8C%EC%88%98-%EB%A1%9C%EC%A7%81-%EC%BA%90%EC%8B%B1-%EA%B5%AC%ED%98%84%ED%95%98%EA%B8%B0
    const redisClient = await connectRedis();

    // expire condition : Date.now() of req >= (Date.now() when caching data + 24hour)
    await redisClient.zRemRangeByScore(feedId, -Infinity, Date.now());

    const isAbusingCached = (await redisClient.zScan(feedId, 0)).members.some(
      (member) => member.value === clientIP
    );

    if (isAbusingCached) {
      await redisClient.disconnect();
      return feed;
    }

    // reference : how to implement expiration of value using Sorted-Set in redis
    // https://stackoverflow.com/questions/7577923/redis-possible-to-expire-an-element-in-an-array-or-sorted-set
    // https://copyprogramming.com/howto/redis-expire-set-element#google_vignette
    // https://groups.google.com/g/redis-db/c/-GSVYNoPfYI
    const expirationTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hour

    // reference : how to use "zAdd"
    // https://stackoverflow.com/questions/70122516/redis-add-to-sorted-set-using-typescript
    await redisClient.zAdd(feedId, {
      score: expirationTime,
      value: clientIP,
    });

    await redisClient.hIncrBy("viewCounts", feedId, 1);

    await redisClient.disconnect();

    return feed;
  };

  likeFeed = async (feedId: string, userId: string) => {
    const existingUser = await (
      await UserDB.getById(userId)
    ).populate("likedFeeds");
    const existingFeed = await FeedDB.getById(feedId);

    const alreadyLiked = existingUser.likedFeeds.some(
      (likedFeedId) => likedFeedId.toString() === feedId
    );

    if (alreadyLiked) {
      throw new CustomError(400, "이미 좋아요를 누른 게시물입니다.");
    }

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      existingFeed.like++;
      await existingFeed.save({ session });

      existingUser.likedFeeds.push(new mongoose.Types.ObjectId(feedId));
      await existingUser.save({ session });

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw new CustomError(500, "좋아요 처리 실패");
    } finally {
      await session.endSession();
    }
  };

  dislikeFeed = async (feedId: string, userId: string) => {
    const existingUser = await (
      await UserDB.getById(userId)
    ).populate("likedFeeds");
    const existingFeed = await FeedDB.getById(feedId);

    const alreadyLiked = existingUser.likedFeeds.some(
      (likedFeedId) => likedFeedId.toString() === feedId
    );

    if (!alreadyLiked) {
      throw new CustomError(400, "좋아요를 누른 적 없는 게시물입니다.");
    }

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      existingFeed.like--;
      await existingFeed.save({ session });

      existingUser.likedFeeds = existingUser.likedFeeds.filter(
        (likedFeed) => likedFeed.toString() !== feedId
      );
      await existingUser.save({ session });

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw new CustomError(500, "좋아요 삭제 처리 실패");
    } finally {
      await session.endSession();
    }
  };
}

export default FeedService;
