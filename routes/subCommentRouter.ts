import { Router } from "express";

import SubCommentController from "../controllers/subCommentController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();
const subCommentController = new SubCommentController();

router.post("/:feedId", authMiddleware, subCommentController.createSubComment);
router.delete(
  "/:feedId/:commentId",
  authMiddleware,
  subCommentController.deleteSubComment
);

export default router;
