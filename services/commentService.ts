import mongoose from "mongoose";

import Comment from "../models/Comment";
import UserDB from "../common/userDB";
import FeedDB from "../common/feedDB";

interface CommentData {
  description: string;
}

class CommentService {
  createComment = async (
    feedId: string,
    userId: string,
    commentData: CommentData
  ) => {
    const existingUser = await UserDB.getById(userId);
    const existingFeed = await FeedDB.getById(feedId);

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
