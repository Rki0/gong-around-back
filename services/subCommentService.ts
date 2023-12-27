import mongoose from "mongoose";

import SubComment from "../models/SubComment";
import UserDB from "../common/userDB";
import FeedDB from "../common/feedDB";
import CommentDB from "../common/commentDB";
import SubCommentDB from "../common/subCommentDB";
import CustomError from "../errors/customError";

import { SubComment as SubCommentData } from "../types/subComment";

class SubCommentService {
  createSubComment = async (
    feedId: string,
    commentId: string,
    userId: string,
    subCommentData: SubCommentData
  ) => {
    await UserDB.getById(userId);
    const existingFeed = await FeedDB.getById(feedId);
    const existingComment = await CommentDB.getById(commentId);

    const createdSubComment = new SubComment({
      description: subCommentData.description,
      writer: userId,
      feed: existingFeed._id,
      parentComment: existingComment._id,
    });

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      await createdSubComment.save({ session });

      existingFeed.subComments.push(createdSubComment._id);
      await existingFeed.save({ session });

      existingComment.subComments.push(createdSubComment._id);
      await existingComment.save({ session });

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw new CustomError(500, "답글 등록 세션 실패");
    } finally {
      await session.endSession();
    }
  };

  deleteSubComment = async (
    feedId: string,
    commentId: string,
    userId: string,
    subCommentId: string
  ) => {
    await UserDB.getById(userId);
    const existingFeed = await FeedDB.getById(feedId);
    const existingComment = await CommentDB.getById(commentId);
    const existingSubComment = await SubCommentDB.getById(subCommentId);
    // SUGGEST: existingSubComment._id보다 subCommentId를 사용하는게 더 나을 것 같다.
    SubCommentDB.verifyWriter(existingSubComment.writer._id.toString(), userId);

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // SUGGEST: existingSubComment._id보다 subCommentId를 사용하는게 더 나을 것 같다.
      // reference : how to delete data in mongoDB with transaction
      // https://stackoverflow.com/questions/65640501/how-to-use-deletemany-in-transaction-of-mongoose
      await SubComment.findByIdAndDelete(existingSubComment._id).session(
        session
      );

      existingFeed.subComments = existingFeed.subComments.filter(
        (data) => data._id.toString() !== subCommentId
      );
      await existingFeed.save({ session });

      existingComment.subComments = existingComment.subComments.filter(
        (data) => data._id.toString() !== subCommentId
      );
      await existingComment.save({ session });

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw new CustomError(500, "답글 삭제 세션 실패");
    } finally {
      await session.endSession();
    }
  };

  updateSubComment = async (
    feedId: string,
    commentId: string,
    userId: string,
    subCommentId: string,
    subCommentData: SubCommentData
  ) => {
    await UserDB.getById(userId);
    await FeedDB.getById(feedId);
    await CommentDB.getById(commentId);

    const existingSubComment = await SubCommentDB.getById(subCommentId);
    // SUGGEST: existingSubComment._id보다 subCommentId를 사용하는게 더 나을 것 같다.
    SubCommentDB.verifyWriter(existingSubComment.writer._id.toString(), userId);

    // SUGGEST: existingSubComment._id보다 subCommentId를 사용하는게 더 나을 것 같다.
    await SubComment.findByIdAndUpdate(existingSubComment._id, {
      description: subCommentData.description,
    });
  };
}

export default SubCommentService;
