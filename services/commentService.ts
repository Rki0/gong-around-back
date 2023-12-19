import mongoose from "mongoose";

import Comment from "../models/Comment";
import SubComment from "../models/SubComment";
import UserDB from "../common/userDB";
import FeedDB from "../common/feedDB";
import CommentDB from "../common/commentDB";

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

  deleteComment = async (feedId: string, commentId: string, userId: string) => {
    const existingUser = await UserDB.getById(userId);
    const existingFeed = await FeedDB.getById(feedId);
    const existingComment = await CommentDB.getById(commentId);
    CommentDB.verifyWriter(existingComment.writer._id.toString(), userId);

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      await Promise.all(
        existingComment.subComments.map(
          async (_id) => await SubComment.deleteOne({ _id }).session(session)
        )
      );

      await Comment.findByIdAndDelete(existingComment._id).session(session);

      existingUser.writedComments = existingUser.writedComments.filter(
        (data) => data._id.toString() !== commentId
      );
      await existingUser.save({ session });

      existingFeed.comments = existingFeed.comments.filter(
        (data) => data._id.toString() !== commentId
      );
      await existingFeed.save({ session });

      await session.commitTransaction();
    } catch (err) {
      console.log(err);
      await session.abortTransaction();
      await session.endSession();
      throw new Error("댓글 삭제 세션 실패");
    }

    await session.endSession();
  };

  updateComment = async (
    feedId: string,
    commentId: string,
    userId: string,
    commentData: CommentData
  ) => {
    await UserDB.getById(userId);
    await FeedDB.getById(feedId);
    const existingComment = await CommentDB.getById(commentId);
    CommentDB.verifyWriter(existingComment.writer._id.toString(), userId);

    try {
      await Comment.findByIdAndUpdate(existingComment._id, {
        description: commentData.description,
      });
    } catch (err) {
      throw new Error("댓글 수정 실패");
    }
  };
}

export default CommentService;
