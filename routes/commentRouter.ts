import { Router } from "express";

import CommentController from "../controllers/commentController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();
const commentController = new CommentController();

router.use(authMiddleware);

router.post("/:feedId", commentController.createComment);
router.delete("/:feedId/:commentId", commentController.deleteComment);
router.patch("/:feedId/:commentId", commentController.updateComment);

export default router;
