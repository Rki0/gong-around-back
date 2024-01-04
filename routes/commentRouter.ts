import { Router } from "express";

import CommentController from "../controllers/commentController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();
const commentController = new CommentController();

router.use(authMiddleware);

/**
 * @swagger
 * paths:
 *  /api/comment/{feedId}:
 *   post:
 *    tags:
 *    - comment
 *    summary: Create comment
 *    description: Create comment about specific feed.
 *    security:
 *      - bearerAuth: []
 *
 *    parameters:
 *      - in: path
 *        name: feedId
 *        required: true
 *        schema:
 *          type: string
 *        description: feed's unique id
 *
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              description:
 *                type: string
 *                example: this is comment!
 *
 *    responses:
 *     '201':
 *      description: Comment was created successfully.
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              message:
 *                type: string
 *                example: 댓글 등록 성공
 *
 */
router.post("/:feedId", commentController.createComment);

/**
 * @swagger
 * paths:
 *  /api/comment/{feedId}/{commentId}:
 *   delete:
 *    tags:
 *    - comment
 *    summary: Delete comment
 *    description: Delete comment about specific feed.
 *    security:
 *      - bearerAuth: []
 *
 *    parameters:
 *      - in: path
 *        name: feedId
 *        required: true
 *        schema:
 *          type: string
 *        description: feed's unique id
 *      - in: path
 *        name: commentId
 *        required: true
 *        schema:
 *          type: string
 *        description: comment's unique id
 *
 *    responses:
 *     '201':
 *      description: Comment was deleted successfully.
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              message:
 *                type: string
 *                example: 댓글 삭제 성공
 *
 */
router.delete("/:feedId/:commentId", commentController.deleteComment);

/**
 * @swagger
 * paths:
 *  /api/comment/{feedId}/{commentId}:
 *   patch:
 *    tags:
 *    - comment
 *    summary: Update comment
 *    description: Update comment about specific feed.
 *    security:
 *      - bearerAuth: []
 *
 *    parameters:
 *      - in: path
 *        name: feedId
 *        required: true
 *        schema:
 *          type: string
 *        description: feed's unique id
 *      - in: path
 *        name: commentId
 *        required: true
 *        schema:
 *          type: string
 *        description: comment's unique id
 *
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              description:
 *                type: string
 *                example: put statement in here what you want to update
 *
 *    responses:
 *     '201':
 *      description: Comment was updated successfully.
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              message:
 *                type: string
 *                example: 댓글 수정 성공
 *
 */
router.patch("/:feedId/:commentId", commentController.updateComment);

/**
 * @swagger
 * paths:
 *  /api/comment/like/{feedId}/{commentId}:
 *   post:
 *    tags:
 *    - comment
 *    summary: Increase like number of comment
 *    description: Increase like number of comment about specific feed.
 *    security:
 *      - bearerAuth: []
 *
 *    parameters:
 *      - in: path
 *        name: feedId
 *        required: true
 *        schema:
 *          type: string
 *        description: feed's unique id
 *      - in: path
 *        name: commentId
 *        required: true
 *        schema:
 *          type: string
 *        description: comment's unique id
 *
 *    responses:
 *     '201':
 *      description: Comment's like successfully increase.
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              message:
 *                type: string
 *                example: 댓글 좋아요 성공
 *
 */
router.post("/like/:feedId/:commentId", commentController.likeComment);

export default router;
