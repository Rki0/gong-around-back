import Comment from "../models/Comment";

class CommentDB {
  static getById = async (commentId: string) => {
    let existingComment;

    try {
      existingComment = await Comment.findById(commentId);
    } catch (err) {
      throw new Error("댓글 정보를 찾을 수 없습니다.");
    }

    if (!existingComment) {
      throw new Error("존재하지 않는 댓글입니다.");
    }

    return existingComment;
  };
}

export default CommentDB;
