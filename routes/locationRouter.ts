import { Router } from "express";

import LocationController from "../controllers/locationController";

const router = Router();
const locationController = new LocationController();

/**
 * @swagger
 * paths:
 *  /api/location:
 *   get:
 *    tags:
 *    - location
 *    summary: Get markers(feeds) around the current location
 *    description: Get a marker with a radius of 20km around current location.
 *
 *    parameters:
 *      - in: query
 *        name: lat
 *        schema:
 *          type: number
 *          description: latitude of the location which want to search
 *      - in: query
 *        name: lng
 *        schema:
 *          type: number
 *          description: longitude of the location which want to search
 *
 *    responses:
 *     '200':
 *      description: 마커 탐색 성공
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              markers:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    _id:
 *                      type: string
 *                      example: asfesife123148asfdf
 *                      description: marker's unique id.
 *                    writer:
 *                      type: string
 *                      example: 2345zxcv123124dfgrg3717
 *                      description: writer's unique id. Not important information in this API.
 *                    address:
 *                      type: string
 *                      example: Gimpo International Airport (GMP), 하늘길 강서구 서울특별시 대한민국
 *                    createdAt:
 *                      type: string
 *                      example: 2023-12-25T14:41:10.758Z
 *                      description: UTC
 *                    updatedAt:
 *                      type: string
 *                      example: 2023-12-25T14:41:10.758Z
 *                      description: UTC
 *                    location:
 *                      type: object
 *                      properties:
 *                        coordinates:
 *                          type: array
 *                          maxItems: 2
 *                          example: [126.8010869, 37.5658264]
 *                          description: first one is longitude, last one is latitude.
 *                          items:
 *                            type: number
 *                    feed:
 *                      type: object
 *                      properties:
 *                        _id:
 *                          type: string
 *                          example: 12345zxcv123124dfgrg
 *                        title:
 *                          type: string
 *                          example: this is title of feed
 *                        description:
 *                          type: string
 *                          example: this is description of feed
 *                        like:
 *                          type: integer
 *                        view:
 *                          type: integer
 *                        images:
 *                          type: array
 *                          items:
 *                            type: object
 *                            properties:
 *                              _id:
 *                                type: string
 *                                example: 1234567asdfzxcv12312d
 *                              path:
 *                                type: string
 *                                example: https://AWS_S3_ADDRESS/FILE_ID.FILE_EXTENSION
 *                        createdAt:
 *                          type: string
 *                          example: 2023-12-25T14:41:10.742Z
 *                          description: UTC
 *                        updatedAt:
 *                          type: string
 *                          example: 2023-12-25T14:41:10.742Z
 *                          description: UTC
 *
 */
router.get("/", locationController.getAroundLocation);

export default router;
