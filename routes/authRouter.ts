import { Router } from "express";

import AuthController from "../controllers/authController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * paths:
 *  /api/auth/signup:
 *   post:
 *    tags:
 *    - auth
 *    summary: Sign Up
 *    description: Sign up user.
 *
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              nickname:
 *                type: string
 *                example: Rki0
 *              email:
 *                type: string
 *                example: test@test.com
 *              password:
 *                type: string
 *                example: password1234@@8811
 *
 *    responses:
 *     '201':
 *      description: 회원 가입 성공
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              message:
 *                type: string
 *                description: 회원 가입 성공 메세지.
 *                example: 성공적으로 회원가입이 완료되었습니다.
 */
router.post("/signup", authController.signUp);

/**
 * @swagger
 * paths:
 *  /api/auth/login:
 *   post:
 *    tags:
 *    - auth
 *    summary: Log In
 *    description: If user logged in, set a refresh token in cookie. And put on an access token in response.
 *
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                example: test@test.com
 *              password:
 *                type: string
 *                example: password1234@@8811
 *
 *    responses:
 *     '201':
 *      description: 회원 가입 성공
 *      headers:
 *        cookie:
 *          description: refresh_token={JWT}
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              access_token:
 *                type: string
 *                description: JWT(Access Token)
 *                example: 623qrt3i7rw4r230-riq329rhaw;fiwopwehfuasf.safiluaugiusl4@#R$#Eeasfksefhukwheu3t647834!@#
 *              userId:
 *                type: string
 *                description: 유저 id
 *                example: afyku1624dzkfd123s2
 *              nickname:
 *                type: string
 *                description: 유저 닉네임
 *                example: Rki0
 *
 */
router.post("/login", authController.logIn);

/**
 * @swagger
 * paths:
 *  /api/auth/logout:
 *   delete:
 *    tags:
 *    - auth
 *    summary: Log Out
 *    description: Delete refresh token from the cookie.
 *    security:
 *      - bearerAuth: []
 *
 *    responses:
 *     '204':
 *      description: 로그아웃 성공
 *      headers:
 *        cookie:
 *          description: refresh_token=null
 *
 */
router.delete("/logout", authMiddleware, authController.logOut);

/**
 * @swagger
 * paths:
 *  /api/auth/resignToken:
 *   get:
 *    tags:
 *    - auth
 *    summary: Resign User
 *    description: |
 *      This API will be called when access token expired.
 *
 *      If refresh token doesn't expired, re-sign access token.
 *
 *      If opposite situation, log out user.
 *    security:
 *      - bearerAuth: []
 *
 *    responses:
 *     '200':
 *      description: This API will be called when access token was expired, but, refresh token still valid.
 *      headers:
 *        cookie:
 *          description: refresh_token={JWT}
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              access_token:
 *                type: string
 *                description: JWT(Access Token)
 *
 */
router.get("/resignToken", authController.reSignAccessToken);

export default router;
