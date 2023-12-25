import { Router } from "express";

import FeedController from "../controllers/feedController";
import authMiddleware from "../middlewares/authMiddleware";
import fileMiddleware from "../middlewares/fileMiddleware";

const router = Router();
const feedController = new FeedController();

router.get("/pagination", feedController.pagination);
router.get("/:feedId", feedController.detailFeed);

router.use(authMiddleware);

router.delete("/:feedId", feedController.deleteFeed);
router.post(
  "/",
  fileMiddleware.array("images", 5), // To get some files, filedName must be equal to FormData's file property "name" which appended by client side logic.
  feedController.createFeed
);
router.post("/:feedId/like", feedController.likeFeed);
router.post("/:feedId/dislike", feedController.dislikeFeed);

export default router;
