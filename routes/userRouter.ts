import { Router } from "express";

import UserController from "../controllers/userController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();
const userController = new UserController();

router.delete("/withdraw", authMiddleware, userController.withdraw);
router.get("/like", authMiddleware, userController.likedFeeds);
router.post("/", authMiddleware, userController.updateInfo);

export default router;
