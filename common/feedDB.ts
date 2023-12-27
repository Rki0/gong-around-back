import Feed from "../models/Feed";
import CustomError from "../errors/customError";

class FeedDB {
  static getById = async (feedId: string) => {
    const existingFeed = await Feed.findById(feedId);

    if (!existingFeed) {
      throw new CustomError(400, "존재하지 않는 게시물입니다.");
    }

    return existingFeed;
  };
}

export default FeedDB;
