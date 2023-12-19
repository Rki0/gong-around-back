import { Router } from "express";

import SubCommentController from "../controllers/subCommentController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();
const subCommentController = new SubCommentController();

// SUGGEST: 댓글, 답글 기능은 전부 로그인을 필요로 하므로 authMiddleware를 맨 위로 빼도 될 것 같다.

// SUGGEST: 얘도 params에 parentCommentId 넣는게 더 나아보인다.
router.post("/:feedId", authMiddleware, subCommentController.createSubComment);
router.delete(
  "/:feedId/:commentId",
  authMiddleware,
  subCommentController.deleteSubComment
);
router.patch(
  "/:feedId/:commentId",
  authMiddleware,
  subCommentController.updateSubComment
);

export default router;
