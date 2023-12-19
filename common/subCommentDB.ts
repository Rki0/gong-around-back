import SubComment from "../models/SubComment";

class SubCommentDB {
  static getById = async (subCommentId: string) => {
    let existingSubComment;

    try {
      existingSubComment = await SubComment.findById(subCommentId);
    } catch (err) {
      throw new Error("답글 정보를 찾을 수 없습니다.");
    }

    if (!existingSubComment) {
      throw new Error("존재하지 않는 답글입니다.");
    }

    return existingSubComment;
  };

  static verifyWriter = (writerId: string, userId: string) => {
    if (writerId !== userId) {
      throw new Error("권한이 없습니다.");
    }
  };
}

export default SubCommentDB;
