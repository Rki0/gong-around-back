import { Router } from "express";

import CommentController from "../controllers/commentController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();
const commentController = new CommentController();

router.post("/:feedId", authMiddleware, commentController.createComment);
router.delete(
  "/:feedId/:commentId",
  authMiddleware,
  commentController.deleteComment
);
router.patch(
  "/:feedId/:commentId",
  authMiddleware,
  commentController.updateComment
);

export default router;
