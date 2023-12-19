import Feed from "../models/Feed";

class FeedDB {
  static getById = async (feedId: string) => {
    let existingFeed;

    try {
      existingFeed = await Feed.findById(feedId);
    } catch (err) {
      throw new Error("게시물 정보를 찾을 수 없습니다.");
    }

    if (!existingFeed) {
      throw new Error("존재하지 않는 게시물입니다.");
    }

    return existingFeed;
  };
}

export default FeedDB;
