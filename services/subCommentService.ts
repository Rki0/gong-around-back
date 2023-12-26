import mongoose from "mongoose";

import SubComment from "../models/SubComment";
import UserDB from "../common/userDB";
import FeedDB from "../common/feedDB";
import CommentDB from "../common/commentDB";
import SubCommentDB from "../common/subCommentDB";

interface SubCommentData {
  description: string;
}

interface DeleteSubCommentData {
  _id: string;
}

interface UpdateSubCommentData {
  _id: string;
  description: string;
}

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
      console.log(err);
      await session.abortTransaction();
      throw new Error("답글 등록 세션 실패");
    } finally {
      await session.endSession();
    }
  };

  deleteSubComment = async (
    feedId: string,
    commentId: string,
    userId: string,
    subCommentData: DeleteSubCommentData
  ) => {
    await UserDB.getById(userId);
    const existingFeed = await FeedDB.getById(feedId);
    const existingComment = await CommentDB.getById(commentId);
    const existingSubComment = await SubCommentDB.getById(subCommentData._id);
    SubCommentDB.verifyWriter(existingSubComment.writer._id.toString(), userId);

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // reference : how to delete data in mongoDB with transaction
      // https://stackoverflow.com/questions/65640501/how-to-use-deletemany-in-transaction-of-mongoose
      await SubComment.findByIdAndDelete(existingSubComment._id).session(
        session
      );

      existingFeed.subComments = existingFeed.subComments.filter(
        (data) => data._id.toString() !== subCommentData._id
      );
      await existingFeed.save({ session });

      existingComment.subComments = existingComment.subComments.filter(
        (data) => data._id.toString() !== subCommentData._id
      );
      await existingComment.save({ session });

      await session.commitTransaction();
    } catch (err) {
      console.log(err);
      await session.abortTransaction();
      throw new Error("답글 삭제 세션 실패");
    } finally {
      await session.endSession();
    }
  };

  updateSubComment = async (
    feedId: string,
    commentId: string,
    userId: string,
    subCommentData: UpdateSubCommentData
  ) => {
    await UserDB.getById(userId);
    await FeedDB.getById(feedId);
    await CommentDB.getById(commentId);

    const existingSubComment = await SubCommentDB.getById(subCommentData._id);
    SubCommentDB.verifyWriter(existingSubComment.writer._id.toString(), userId);

    try {
      await SubComment.findByIdAndUpdate(existingSubComment._id, {
        description: subCommentData.description,
      });
    } catch (err) {
      throw new Error("답글 수정 실패");
    }
  };
}

export default SubCommentService;
