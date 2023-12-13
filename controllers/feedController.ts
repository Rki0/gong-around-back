import { Request, Response } from "express";

import FeedService from "../services/feedService";

class FeedController {
  public feedService: FeedService;

  constructor() {
    this.feedService = new FeedService();
  }

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
}

export default FeedController;
