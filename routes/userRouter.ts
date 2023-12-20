import { Router } from "express";

import UserController from "../controllers/userController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();
const userController = new UserController();

router.delete("/withdraw", authMiddleware, userController.withdraw);

export default router;
