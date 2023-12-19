import mongoose from "mongoose";

import Comment from "../models/Comment";
import Feed from "../models/Feed";
import User from "../models/User";
import SubComment from "../models/SubComment";

interface SubCommentData {
  description: string;
  parentCommentId: string;
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
    userId: string,
    subCommentData: SubCommentData
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

    let existingComment;

    try {
      existingComment = await Comment.findById(subCommentData.parentCommentId);
    } catch (err) {
      throw new Error("댓글 정보를 찾을 수 없습니다.");
    }

    if (!existingComment) {
      throw new Error("존재하지 않는 댓글입니다.");
    }

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

    let existingComment;

    try {
      existingComment = await Comment.findById(commentId);
    } catch (err) {
      throw new Error("댓글 정보를 찾을 수 없습니다.");
    }

    if (!existingComment) {
      throw new Error("존재하지 않는 댓글입니다.");
    }

    let existingSubComment;

    try {
      existingSubComment = await SubComment.findById(subCommentData._id);
    } catch (err) {
      throw new Error("답글 정보를 찾을 수 없습니다.");
    }

    if (!existingSubComment) {
      throw new Error("존재하지 않는 답글입니다.");
    }

    // TODO: 답글 작성자인지 아닌지 판단하는 로직 필요

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

    let existingComment;

    try {
      existingComment = await Comment.findById(commentId);
    } catch (err) {
      throw new Error("댓글 정보를 찾을 수 없습니다.");
    }

    if (!existingComment) {
      throw new Error("존재하지 않는 댓글입니다.");
    }

    let existingSubComment;

    try {
      existingSubComment = await SubComment.findById(subCommentData._id);
    } catch (err) {
      throw new Error("답글 정보를 찾을 수 없습니다.");
    }

    if (!existingSubComment) {
      throw new Error("존재하지 않는 답글입니다.");
    }

    if (existingSubComment.writer._id.toString() !== userId) {
      throw new Error("권한이 없습니다.");
    }

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
