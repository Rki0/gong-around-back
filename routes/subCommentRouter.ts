import { Router } from "express";

import SubCommentController from "../controllers/subCommentController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();
const subCommentController = new SubCommentController();

router.use(authMiddleware);

/**
 * @swagger
 * paths:
 *  /api/subcomment/{feedId}/{commentId}:
 *   post:
 *    tags:
 *    - subComment
 *    summary: Create sub-comment
 *    description: Create sub-comment about specific feed and comment.
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
 *              description:
 *                type: string
 *                example: this is subcomment
 *
 *    responses:
 *     '201':
 *      description: Sub-comment was created successfully.
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              message:
 *                type: string
 *                example: 답글 등록 성공
 *
 */
router.post("/:feedId/:commentId", subCommentController.createSubComment);

/**
 * @swagger
 * paths:
 *  /api/subcomment/{feedId}/{commentId}:
 *   delete:
 *    tags:
 *    - subComment
 *    summary: Delete sub-comment
 *    description: Delete sub-comment about specific feed and comment.
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
 *              _id:
 *                type: string
 *                description: id of sub-comment
 *                example: 126yefajru283745sdf
 *
 *    responses:
 *     '201':
 *      description: Sub-comment was deleted successfully.
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              message:
 *                type: string
 *                example: 답글 삭제 성공
 *
 */
router.delete("/:feedId/:commentId", subCommentController.deleteSubComment);

/**
 * @swagger
 * paths:
 *  /api/subcomment/{feedId}/{commentId}:
 *   patch:
 *    tags:
 *    - subComment
 *    summary: Update sub-comment
 *    description: Update sub-comment about specific feed and comment.
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
 *              _id:
 *                type: string
 *                description: id of sub-comment
 *                example: 126412esfuafksfj
 *              description:
 *                type: string
 *                example: put statement in here what you want to update!
 *
 *    responses:
 *     '201':
 *      description: Sub-comment was updated successfully.
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              message:
 *                type: string
 *                example: 답글 수정 성공
 *
 */
router.patch("/:feedId/:commentId", subCommentController.updateSubComment);

export default router;
