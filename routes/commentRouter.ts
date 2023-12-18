import { Router } from "express";

import CommentController from "../controllers/commentController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();
const commentController = new CommentController();

router.post("/:feedId", authMiddleware, commentController.createComment);

export default router;
