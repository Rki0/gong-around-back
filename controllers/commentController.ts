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
}

export default CommentController;
