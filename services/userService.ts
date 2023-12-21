import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

import Comment from "../models/Comment";
import SubComment from "../models/SubComment";
import Feed from "../models/Feed";
import User from "../models/User";
import UserDB from "../common/userDB";
import Location from "../models/Location";
import Image from "../models/Image";

class UserService {
  // 회원 탈퇴를 하더라도 그 유저가 만들어낸 좋아요 증가분은 유지하도록 한다.
  withdraw = async (userId: string, password: string) => {
    const existingUser = await UserDB.getById(userId);

    let isValidPassword = false;

    try {
      isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
      throw new Error("비밀번호 비교가 실패했습니다.");
    }

    if (!isValidPassword) {
      throw new Error("비밀번호가 일치하지 않습니다.");
    }

    const session = await mongoose.startSession();

    try {
      const s3 = new S3Client({
        region: process.env.AWS_REGION,
      });

      const images = await Image.find({ writer: existingUser._id });

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
      console.log(err);
      await session.abortTransaction();
      await session.endSession();
      throw new Error("회원 탈퇴 세션 실패");
    }

    await session.endSession();
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

    try {
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
    } catch (err) {
      console.log(err);
      throw new Error("좋아요 누른 게시물 탐색 실패");
    }
  };
}

export default UserService;
