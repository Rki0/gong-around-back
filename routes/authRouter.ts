import { Router } from "express";

import AuthController from "../controllers/authController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();
const authController = new AuthController();

router.post("/signup", authController.signUp);
router.post("/login", authController.logIn);
router.delete("/logout", authMiddleware, authController.logOut);
router.get("/resignToken", authController.reSignAccessToken);

export default router;
