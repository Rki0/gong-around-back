import mongoose from "mongoose";

import Comment from "../models/Comment";
import Feed from "../models/Feed";
import User from "../models/User";

interface CommentData {
  description: string;
}

class CommentService {
  createComment = async (
    feedId: string,
    userId: string,
    commentData: CommentData
  ) => {
    let existingUser;

    try {
      existingUser = await User.findById(userId);
    } catch (err) {
      throw new Error("유저 정보를 찾을 수 없습니다.");
    }

    if (!existingUser) {
      throw new Error("존재하지 않는 유저입니다.");
    }

    let existingFeed;

    try {
      existingFeed = await Feed.findById(feedId);
    } catch (err) {
      throw new Error("게시물 정보를 찾을 수 없습니다.");
    }

    if (!existingFeed) {
      throw new Error("존재하지 않는 게시물입니다.");
    }

    const createdComment = new Comment({
      description: commentData.description,
      writer: existingUser._id,
      feed: existingFeed._id,
    });

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      await createdComment.save({ session });

      existingUser.writedComments.push(createdComment._id);
      await existingUser.save({ session });

      existingFeed.comments.push(createdComment._id);
      await existingFeed.save({ session });

      await session.commitTransaction();
    } catch (err) {
      console.log(err);
      await session.abortTransaction();
      await session.endSession();
      throw new Error("댓글 등록 세션 실패");
    }

    await session.endSession();
  };
}

export default CommentService;
