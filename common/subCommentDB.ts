import SubComment from "../models/SubComment";
import CustomError from "../errors/customError";

class SubCommentDB {
  static getById = async (subCommentId: string) => {
    const existingSubComment = await SubComment.findById(subCommentId);

    if (!existingSubComment) {
      throw new CustomError(400, "존재하지 않는 답글입니다.");
    }

    return existingSubComment;
  };

  static verifyWriter = (writerId: string, userId: string) => {
    if (writerId !== userId) {
      throw new CustomError(403, "권한이 없습니다.");
    }
  };
}

export default SubCommentDB;
