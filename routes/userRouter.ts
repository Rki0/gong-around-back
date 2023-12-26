import { Router } from "express";

import UserController from "../controllers/userController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();
const userController = new UserController();

router.use(authMiddleware);

/**
 * @swagger
 * paths:
 *  /api/user/withdraw:
 *   delete:
 *    tags:
 *    - user
 *    summary: Withdraw user
 *    description: delete entire information related to user
 *    security:
 *      - bearerAuth: []
 *
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              password:
 *                type: string
 *                example: password1234@@8811
 *
 *    responses:
 *     '204':
 *        description: 회원 탈퇴 성공
 *        headers:
 *          cookie:
 *            description: refresh_token=null
 *        content:
 *          application/json:
 *            schema:
 *              properties:
 *                message:
 *                  type: string
 *                  example: 회원 탈퇴 성공
 *
 */
router.delete("/withdraw", userController.withdraw);

/**
 * @swagger
 * paths:
 *  /api/user/like:
 *   get:
 *    tags:
 *    - user
 *    summary: Get 10 liked feeds
 *    description: Get 10 liked feeds using pagination
 *    security:
 *      - bearerAuth: []
 *
 *    parameters:
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          description: Number of page which you want to get.
 *
 *    responses:
 *     '200':
 *        description: 좋아요 누른 게시물 탐색 성공
 *        content:
 *          application/json:
 *            schema:
 *              properties:
 *                hasMore:
 *                  type: boolean
 *                  description: whether there are more pages or not
 *                  example: true
 *                feeds:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      _id:
 *                        type: string
 *                        description: feed's unique id
 *                        example: 24781dsajkf78318d
 *                      title:
 *                        type: string
 *                        description: title of feed
 *                        example: this is title of feed
 *                      description:
 *                        type: string
 *                        description: description of feed
 *                        example: this is description of feed
 *                      location:
 *                        type: object
 *                        properties:
 *                          _id:
 *                            type: string
 *                            description: location's unique id
 *                            example: fuasleihf72184y1jcf
 *                          address:
 *                            type: string
 *                            example: Haneda Airport (HND), 하네다쿠코 오타구 도쿄도 일본
 *                      images:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                            _id:
 *                              type: string
 *                              description: image's unique id
 *                              example: fausef273y418fzdsf23
 *                            path:
 *                              type: string
 *                              example: https://AWS_S3_ADDRESS/FILE_ID.FILE_EXTENSION
 *
 */
router.get("/like", userController.likedFeeds);

/**
 * @swagger
 * paths:
 *  /api/user:
 *   post:
 *    tags:
 *    - user
 *    summary: Update user information
 *    description: |
 *      Update user information like nickname or password.
 *
 *      If you want to change only nickname, you should pass only nickname property.
 *
 *      If you want to change only password, you should pass password and newPassword property.
 *
 *      If you want to change both, you should pass all of them.
 *    security:
 *      - bearerAuth: []
 *
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              newNickname:
 *                type: string
 *                required: false
 *                description: nickname which you want to change
 *                example: Rki1
 *              password:
 *                type: string
 *                required: false
 *                description: your previous password
 *                example: password1234@@8811
 *              newPassword:
 *                type: string
 *                required: false
 *                description: password which you want to change
 *                example: newpassword5678@@9900
 *
 *    responses:
 *     '201':
 *        description: 회원 정보 수정 성공
 *        headers:
 *          cookie:
 *            description: refresh_token=null
 *        content:
 *          application/json:
 *            schema:
 *              properties:
 *                message:
 *                  type: string
 *                  example: 회원 정보 수정 성공
 *
 */
router.post("/", userController.updateInfo);

export default router;
