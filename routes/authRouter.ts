import { Router } from "express";

import AuthController from "../controllers/authController";

const router = Router();
const authController = new AuthController();

router.post("/signup", authController.signUp);

export default router;
