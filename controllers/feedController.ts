import { Request, Response } from "express";

import FeedService from "../services/feedService";
import { getClientIPv4 } from "../utils/getClientIPv4";

class FeedController {
  public feedService: FeedService;

  constructor() {
    this.feedService = new FeedService();
  }

  pagination = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10);
    const sort = (req.query.sort as string) ?? "date";
    const keyword = req.query.keyword as string;

    const pageData = await this.feedService.pagination(page, sort, keyword);

    return res.status(200).json(pageData);
  };

  createFeed = async (req: Request, res: Response) => {
    const userId = req.userId as string;

    const parsedLocation = JSON.parse(req.body.location);

    const feedData = {
      ...req.body,
      images: req.files,
      location: parsedLocation,
    };

    await this.feedService.createFeed(userId, feedData);

    return res.status(201).json({ message: "게시물 등록 성공" });
  };

  deleteFeed = async (req: Request, res: Response) => {
    const userId = req.userId as string;
    const feedId = req.params.feedId;

    await this.feedService.deleteFeed(userId, feedId);

    return res.status(204).json({ message: "게시물 삭제 성공" });
  };

  detailFeed = async (req: Request, res: Response) => {
    const feedId = req.params.feedId;

    // reference : how to get client IP address which calls this API
    // https://stackoverflow.com/questions/10849687/express-js-how-to-get-remote-client-address
    // https://www.abstractapi.com/guides/node-js-get-ip-address
    // https://satisfactoryplace.tistory.com/368
    // SUGGEST: IP address can be forged. So, MAC address can be more suitable this feature.
    // FIXME: 이 로직은 Controller보다 Service에서 담당하는게 맞는듯?
    const clientIP = getClientIPv4();

    const feed = await this.feedService.detailFeed(feedId, clientIP);

    return res.status(200).json(feed);
  };

  likeFeed = async (req: Request, res: Response) => {
    const feedId = req.params.feedId;
    const userId = req.userId as string;

    await this.feedService.likeFeed(feedId, userId);

    return res.status(201).json({ message: "좋아요 처리 성공" });
  };

  dislikeFeed = async (req: Request, res: Response) => {
    const feedId = req.params.feedId;
    const userId = req.userId as string;

    await this.feedService.dislikeFeed(feedId, userId);

    return res.status(201).json({ message: "좋아요 삭제 처리 성공" });
  };
}

export default FeedController;
