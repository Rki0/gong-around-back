import { Router } from "express";

import SubCommentController from "../controllers/subCommentController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();
const subCommentController = new SubCommentController();

router.use(authMiddleware);

router.post("/:feedId/:commentId", subCommentController.createSubComment);
router.delete("/:feedId/:commentId", subCommentController.deleteSubComment);
router.patch("/:feedId/:commentId", subCommentController.updateSubComment);

export default router;
