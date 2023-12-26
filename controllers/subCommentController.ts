import { Request, Response } from "express";

import SubCommentService from "../services/subCommentService";

class SubCommentController {
  public subCommentService: SubCommentService;

  constructor() {
    this.subCommentService = new SubCommentService();
  }

  createSubComment = async (req: Request, res: Response) => {
    const feedId = req.params.feedId;
    const commentId = req.params.commentId;
    const userId = req.userId as string;
    const subCommentData = req.body;

    try {
      await this.subCommentService.createSubComment(
        feedId,
        commentId,
        userId,
        subCommentData
      );

      return res.status(201).json({ message: "답글 등록 성공" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err.message });
    }
  };

  deleteSubComment = async (req: Request, res: Response) => {
    const feedId = req.params.feedId;
    const commentId = req.params.commentId;
    const subCommentId = req.params.subCommentId;
    const userId = req.userId as string;

    try {
      await this.subCommentService.deleteSubComment(
        feedId,
        commentId,
        userId,
        subCommentId
      );

      return res.status(201).json({ message: "답글 삭제 성공" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err.message });
    }
  };

  updateSubComment = async (req: Request, res: Response) => {
    const feedId = req.params.feedId;
    const commentId = req.params.commentId;
    const subCommentId = req.params.subCommentId;
    const userId = req.userId as string;
    const subCommentData = req.body;

    try {
      await this.subCommentService.updateSubComment(
        feedId,
        commentId,
        userId,
        subCommentId,
        subCommentData
      );

      return res.status(201).json({ message: "답글 수정 성공" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err.message });
    }
  };
}

export default SubCommentController;
