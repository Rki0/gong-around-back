import { Router } from "express";

import UserController from "../controllers/userController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();
const userController = new UserController();

router.use(authMiddleware);

router.delete("/withdraw", userController.withdraw);
router.get("/like", userController.likedFeeds);
router.post("/", userController.updateInfo);

export default router;
