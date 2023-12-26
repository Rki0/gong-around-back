import { Router } from "express";

import FeedController from "../controllers/feedController";
import authMiddleware from "../middlewares/authMiddleware";
import fileMiddleware from "../middlewares/fileMiddleware";

const router = Router();
const feedController = new FeedController();

/**
 * @swagger
 * paths:
 *  /api/feed/pagination:
 *   get:
 *    tags:
 *    - feed
 *    summary: Get paginated feed
 *    description: Get 10 paginated feed using inputted page number and keyword.
 *
 *    parameters:
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          description: Number of page which you want to get.
 *      - in: query
 *        name: keyword
 *        schema:
 *          type: string
 *          description: Keyword which you want search.
 *
 *    responses:
 *     '200':
 *      description: Sub-comment was updated successfully.
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              currentPageFeeds:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    _id:
 *                      type: string
 *                      description: id of feed
 *                      example: 126wukafy2613jse
 *                    title:
 *                      type: string
 *                      description: title of feed
 *                      example: this is title of feed
 *                    description:
 *                      type: string
 *                      description: description of feed
 *                      example: this is description of feed
 *                    like:
 *                      type: integer
 *                      description: like number of feed
 *                    view:
 *                      type: integer
 *                      description: view number of feed
 *                    createdAt:
 *                      type: string
 *                      description: UTC
 *                      example: 2023-12-25T10:41:35.731Z
 *                    commentsCount:
 *                      type: integer
 *                      description: comments counts of feed
 *                    subCommentsCount:
 *                      type: integer
 *                      description: subcomments counts of feed
 *              totalPageNum:
 *                type: integer
 *                example: 13
 *                description: total number of pages which can get with feeds per page
 *              paginationStartNum:
 *                type: integer
 *                example: 1
 *                description: start number of pagination calculated from inputted page number.
 *              paginationEndNum:
 *                type: integer
 *                example: 10
 *                description: end number of pagination calculated from inputted page number.
 *              hasMore:
 *                type: boolean
 *                example: true
 *                description: tell whether there is more page or not.
 *
 *
 */
router.get("/pagination", feedController.pagination);

/**
 * @swagger
 * paths:
 *  /api/feed/{feedId}:
 *   get:
 *    tags:
 *    - feed
 *    summary: Get detailed feed
 *    description: Get detail about specific feed.
 *
 *    parameters:
 *      - in: path
 *        name: feedId
 *        required: true
 *        schema:
 *          type: string
 *        description: feed's unique id
 *
 *    responses:
 *     '200':
 *      description: Detail about specific feed.
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              _id:
 *                type: string
 *                description: feed's unique id
 *                example: 638490218dhahsg126se3
 *              title:
 *                type: string
 *                example: this is title of feed
 *              location:
 *                type: object
 *                properties:
 *                  _id:
 *                    type: string
 *                    description: location's unique id
 *                    example: 234y61007yajsfse21
 *                  address:
 *                    type: string
 *                    example: Haneda Airport (HND), 하네다쿠코 오타구 도쿄도 일본
 *              writer:
 *                type: object
 *                properties:
 *                  _id:
 *                    type: string
 *                    description: user's unique id
 *                    example: awuefr27419yajf71281
 *                  nickname:
 *                    type: string
 *                    example: Rki0
 *              description:
 *                type: string
 *                example: this is description of feed
 *              like:
 *                type: integer
 *              view:
 *                type: integer
 *              comments:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    _id:
 *                      type: string
 *                      description: comment's unique id
 *                      example: 1267dhsf16234
 *                    writer:
 *                      type: object
 *                      properties:
 *                        _id:
 *                          type: string
 *                          description: user's unique id who write this comment
 *                          example: 72jhdf1887eofkj17276
 *                        nickname:
 *                          type: string
 *                          example: Yolo
 *                    description:
 *                      type: string
 *                      example: this is comment
 *                    like:
 *                      type: integer
 *                    createdAt:
 *                      type: string
 *                      description: UTC
 *                      example: 2023-12-25T10:41:35.690Z
 *                    updatedAt:
 *                      type: string
 *                      description: UTC
 *                      example: 2023-12-25T10:41:35.690Z
 *                    subComments:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          _id:
 *                            type: string
 *                            description: subcomment's unique id
 *                            example: 12738tdnjkfa1627
 *                          writer:
 *                            type: object
 *                            properties:
 *                              _id:
 *                                type: string
 *                                example: aur6q723167djskfa
 *                                description: writer's unique id who write this subcomment
 *                              nickname:
 *                                type: string
 *                                example: Haru
 *                          description:
 *                            type: string
 *                            example: this is subcomment
 *                          like:
 *                            type: integer
 *                          parentComment:
 *                            type: string
 *                            example: 1267dhsf16234
 *                            description: same with comment id which contain this subcomment
 *                          createdAt:
 *                            type: string
 *                            description: UTC
 *                            example: 2023-12-25T10:41:35.690Z
 *                          updatedAt:
 *                            type: string
 *                            description: UTC
 *                            example: 2023-12-25T10:41:35.690Z
 *              images:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    _id:
 *                      type: string
 *                      description: image's unique id
 *                      example: 167e7q927sdakjfs2
 *                    path:
 *                      type: string
 *                      example: https://AWS_S3_ADDRESS/FILE_ID.FILE_EXTENSION
 *              createdAt:
 *                type: string
 *                description: UTC
 *                example: 2023-12-25T09:49:01.640
 *              updatedAt:
 *                type: string
 *                description: UTC
 *                example: 2023-12-25T09:49:01.640
 *
 */
router.get("/:feedId", feedController.detailFeed);

router.use(authMiddleware);

/**
 * @swagger
 * paths:
 *  /api/feed/{feedId}:
 *   delete:
 *    tags:
 *    - feed
 *    summary: Delete specific feed
 *    description: Delete specific feed.
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
 *    responses:
 *     '204':
 *      description: Delete specific feed.
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              message:
 *                type: string
 *                example: 게시물 삭제 성공
 *
 */
router.delete("/:feedId", feedController.deleteFeed);

/**
 * @swagger
 * paths:
 *  /api/feed:
 *   post:
 *    tags:
 *    - feed
 *    summary: Create feed
 *    description: Create feed.
 *    security:
 *      - bearerAuth: []
 *
 *    requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              title:
 *                type: string
 *                example: this is title of feed
 *              description:
 *                type: string
 *                example: this is description of feed
 *              date:
 *                type: string
 *                description: YYYY-MM-DD
 *                example: 2023-12-26
 *              location:
 *                type: object
 *                properties:
 *                  lat:
 *                    type: number
 *                    example: 37.5658264
 *                  lng:
 *                    type: number
 *                    example: 126.8010869
 *                  address:
 *                    type: string
 *                    example: Gimpo International Airport (GMP), 하늘길 강서구 서울특별시 대한민국
 *              images:
 *                type: array
 *                description: png, jpg, jpeg
 *                items:
 *                  type: object
 *                  properties:
 *                    type: string
 *                    format: binary
 *
 *    responses:
 *     '201':
 *      description: Delete specific feed.
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              message:
 *                type: string
 *                example: 게시물 등록 성공
 *
 */
router.post(
  "/",
  fileMiddleware.array("images", 5), // To get some files, filedName must be equal to FormData's file property "name" which appended by client side logic.
  feedController.createFeed
);

/**
 * @swagger
 * paths:
 *  /api/feed/{feedId}/like:
 *   post:
 *    tags:
 *    - feed
 *    summary: Increment like of feed
 *    description: Increment like of feed.
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
 *    responses:
 *     '201':
 *      description: Increment like of feed.
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              message:
 *                type: string
 *                example: 좋아요 처리 성공
 *
 */
router.post("/:feedId/like", feedController.likeFeed);

/**
 * @swagger
 * paths:
 *  /api/feed/{feedId}/dislike:
 *   post:
 *    tags:
 *    - feed
 *    summary: Decrement like of feed
 *    description: Decrement like of feed.
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
 *    responses:
 *     '201':
 *      description: Decrement like of feed.
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              message:
 *                type: string
 *                example: 좋아요 삭제 처리 성공
 *
 */
router.post("/:feedId/dislike", feedController.dislikeFeed);

export default router;
