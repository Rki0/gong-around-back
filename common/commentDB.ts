import Comment from "../models/Comment";
import CustomError from "../errors/customError";

class CommentDB {
  static getById = async (commentId: string) => {
    const existingComment = await Comment.findById(commentId);

    if (!existingComment) {
      throw new CustomError(400, "존재하지 않는 댓글입니다.");
    }

    return existingComment;
  };

  static verifyWriter = (writerId: string, userId: string) => {
    if (writerId !== userId) {
      throw new CustomError(403, "권한이 없습니다.");
    }
  };
}

export default CommentDB;
