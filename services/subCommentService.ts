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
    const existingUser = await UserDB.getById(userId);
    const existingFeed = await FeedDB.getById(feedId);
    const existingComment = await CommentDB.getById(commentId);

    const createdSubComment = new SubComment({
      description: subCommentData.description,
      writer: existingUser._id,
      feed: existingFeed._id,
      parentComment: existingComment._id,
    });

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      await createdSubComment.save({ session });

      existingUser.writedSubComments.push(createdSubComment._id);
      await existingUser.save({ session });

      existingFeed.subComments.push(createdSubComment._id);
      await existingFeed.save({ session });

      existingComment.subComments.push(createdSubComment._id);
      await existingComment.save({ session });

      await session.commitTransaction();
    } catch (err) {
      console.log(err);
      await session.abortTransaction();
      await session.endSession();
      throw new Error("답글 등록 세션 실패");
    }

    await session.endSession();
  };

  deleteSubComment = async (
    feedId: string,
    commentId: string,
    userId: string,
    subCommentData: DeleteSubCommentData
  ) => {
    const existingUser = await UserDB.getById(userId);
    const existingFeed = await FeedDB.getById(feedId);
    const existingComment = await CommentDB.getById(commentId);
    const existingSubComment = await SubCommentDB.getById(subCommentData._id);
    SubCommentDB.verifyWriter(existingSubComment.writer._id.toString(), userId);

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // reference : how to delete data in mongoDB with transaction
      // https://stackoverflow.com/questions/65640501/how-to-use-deletemany-in-transaction-of-mongoose
      await existingSubComment
        .deleteOne({ _id: subCommentData._id })
        .session(session);

      existingUser.writedSubComments = existingUser.writedSubComments.filter(
        (data) => data._id.toString() !== subCommentData._id
      );
      await existingUser.save({ session });

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
      await session.endSession();
      throw new Error("답글 삭제 세션 실패");
    }

    await session.endSession();
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

    // SUGGEST: existingSubComment로 하는게 나을 것 같다.
    try {
      await SubComment.findOneAndUpdate(
        { _id: subCommentData._id },
        { description: subCommentData.description }
      );
    } catch (err) {
      throw new Error("답글 수정 실패");
    }
  };
}

export default SubCommentService;
