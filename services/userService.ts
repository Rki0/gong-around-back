import mongoose from "mongoose";

import Comment from "../models/Comment";
import SubComment from "../models/SubComment";
import Feed from "../models/Feed";
import User from "../models/User";
import UserDB from "../common/userDB";
import Location from "../models/Location";
import Image from "../models/Image";
import BcryptModule from "../common/bcryptModule";
import S3Module from "../common/s3Module";
import CustomError from "../errors/customError";
import connectRedis from "../utils/redis";

import { UpdatedUserInfo } from "../types/user";

class UserService {
  // 회원 탈퇴를 하더라도 그 유저가 만들어낸 좋아요 증가분은 유지하도록 한다.
  withdraw = async (userId: string, password: string) => {
    const existingUser = await UserDB.getById(userId);
    await BcryptModule.checkPassword(password, existingUser.password);

    const session = await mongoose.startSession();

    try {
      const s3 = S3Module.openClient();

      const images = await Image.find({ writer: existingUser._id });

      await S3Module.deleteMany(s3, images);

      const feeds = await Feed.find({ writer: userId }, "_id");

      const redisClient = await connectRedis();

      await Promise.all(
        feeds.map(async (feed) => await redisClient.del(feed.toString()))
      );

      await redisClient.disconnect();

      session.startTransaction();

      await SubComment.deleteMany({ writer: existingUser._id }).session(
        session
      );
      await Comment.deleteMany({ writer: existingUser._id }).session(session);
      await Location.deleteMany({ writer: existingUser._id }).session(session);
      await Image.deleteMany({ writer: existingUser._id }).session(session);
      await Feed.deleteMany({ writer: existingUser._id }).session(session);
      await User.findByIdAndDelete(userId).session(session);

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw new CustomError(500, "회원 탈퇴 세션 실패");
    } finally {
      await session.endSession();
    }
  };

  likedFeeds = async (userId: string, page: number) => {
    const existingUser = await UserDB.getById(userId);

    const FEEDS_PER_PAGE = 2;
    const TOTAL_FEEDS_LENGTH = existingUser.likedFeeds.length;
    const totalPages = Math.ceil(TOTAL_FEEDS_LENGTH / FEEDS_PER_PAGE);
    const endIndex = TOTAL_FEEDS_LENGTH - 1 - (page - 1) * FEEDS_PER_PAGE + 1;
    const calculatedStartIndex = endIndex - FEEDS_PER_PAGE;
    const startIndex = calculatedStartIndex < 0 ? 0 : calculatedStartIndex;
    const hasMore = page !== totalPages;

    await existingUser.populate({
      path: "likedFeeds",
      select: "title description images location",
      populate: [
        { path: "location", select: "address" },
        {
          path: "images",
          select: "path",
          options: { limit: 1 },
        },
      ],
    });

    // Q: why not use skip(), limit()?
    // A: Because likedFeeds aren't model, I couldn't use those API. So, I implement pagination manually.
    const slicedLikedFeed = existingUser.likedFeeds
      .slice(startIndex, endIndex)
      .reverse();

    const result = {
      feeds: slicedLikedFeed,
      hasMore,
    };

    return result;
  };

  updateInfo = async (userId: string, inputtedInfo: UpdatedUserInfo) => {
    const existingUser = await UserDB.getById(userId);

    if (inputtedInfo.password && inputtedInfo.newPassword) {
      await BcryptModule.checkPassword(
        inputtedInfo.password,
        existingUser.password
      );

      const hashedPassword = await BcryptModule.hashPassword(
        inputtedInfo.newPassword
      );

      existingUser.password = hashedPassword;
    }

    if (inputtedInfo.newNickname) {
      existingUser.nickname = inputtedInfo.newNickname;
    }

    await existingUser.save();
  };
}

export default UserService;
