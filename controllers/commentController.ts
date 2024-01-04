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

    await this.commentService.createComment(feedId, userId, commentData);

    return res.status(201).json({ message: "댓글 등록 성공" });
  };

  deleteComment = async (req: Request, res: Response) => {
    const feedId = req.params.feedId;
    const commentId = req.params.commentId;
    const userId = req.userId as string;

    await this.commentService.deleteComment(feedId, commentId, userId);

    return res.status(204).json();
  };

  updateComment = async (req: Request, res: Response) => {
    const feedId = req.params.feedId;
    const commentId = req.params.commentId;
    const userId = req.userId as string;
    const commentData = req.body;

    await this.commentService.updateComment(
      feedId,
      commentId,
      userId,
      commentData
    );

    return res.status(201).json({ message: "댓글 수정 성공" });
  };

  likeComment = async (req: Request, res: Response) => {
    const feedId = req.params.feedId;
    const commentId = req.params.commentId;
    const userId = req.userId as string;

    await this.commentService.likeComment(feedId, commentId, userId);

    return res.status(201).json({ message: "댓글 좋아요 성공" });
  };

  dislikeComment = async (req: Request, res: Response) => {
    const feedId = req.params.feedId;
    const commentId = req.params.commentId;
    const userId = req.userId as string;

    await this.commentService.dislikeComment(feedId, commentId, userId);

    return res.status(201).json({ message: "댓글 좋아요 취소 성공" });
  };
}

export default CommentController;
