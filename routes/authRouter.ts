import { Router } from "express";

import AuthController from "../controllers/authController";

const router = Router();
const authController = new AuthController();

router.post("/signup", authController.signUp);
router.post("/login", authController.logIn);

export default router;
