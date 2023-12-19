import { Request, Response } from "express";

import CommentService from "../services/commentService";

class CommentController {
  public commentService: CommentService;

  constructor() {
    this.commentService = new CommentService();
  }

  createComment = async (req: Request, res: Response) => {
    const feedId = req.params.feedId;
    const userId = req.userId as string;
    const commentData = req.body;

    try {
      await this.commentService.createComment(feedId, userId, commentData);

      return res.status(201).json({ message: "댓글 등록 성공" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err.message });
    }
  };

  deleteComment = async (req: Request, res: Response) => {
    const feedId = req.params.feedId;
    const commentId = req.params.commentId;
    const userId = req.userId as string;

    try {
      await this.commentService.deleteComment(feedId, commentId, userId);

      return res.status(201).json({ message: "댓글 삭제 성공" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err.message });
    }
  };

  updateComment = async (req: Request, res: Response) => {
    const feedId = req.params.feedId;
    const commentId = req.params.commentId;
    const userId = req.userId as string;
    const commentData = req.body;

    try {
      await this.commentService.updateComment(
        feedId,
        commentId,
        userId,
        commentData
      );

      return res.status(201).json({ message: "댓글 수정 성공" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err.message });
    }
  };
}

export default CommentController;
