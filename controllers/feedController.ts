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
    const keyword = req.query.keyword as string;

    try {
      const pageData = await this.feedService.pagination(page, keyword);

      return res.status(200).json(pageData);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err.message });
    }
  };

  createFeed = async (req: Request, res: Response) => {
    const userId = req.userId;

    if (!userId) {
      return;
    }

    const parsedLocation = JSON.parse(req.body.location);

    const feedData = {
      ...req.body,
      images: req.files,
      location: parsedLocation,
    };

    try {
      await this.feedService.createFeed(userId, feedData);

      return res.status(201).json({ message: "게시물 등록 성공" });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };

  detailFeed = async (req: Request, res: Response) => {
    const feedId = req.params.feedId;

    // reference : how to get client IP address which calls this API
    // https://stackoverflow.com/questions/10849687/express-js-how-to-get-remote-client-address
    // https://www.abstractapi.com/guides/node-js-get-ip-address
    // https://satisfactoryplace.tistory.com/368
    // SUGGEST: IP address can be forged. So, MAC address can be more suitable this feature.
    const clientIP = getClientIPv4();

    try {
      const feed = await this.feedService.detailFeed(feedId, clientIP);

      return res.status(200).json(feed);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };
}

export default FeedController;
