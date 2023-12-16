import { scheduleJob } from "node-schedule";

import connectRedis from "../utils/redis";
import Feed from "../models/Feed";

const viewCountScheduler = () => {
  // execute job every 10 minute
  return scheduleJob("*/10 * * * *", async () => {
    const redisClient = await connectRedis();

    try {
      // reference : what is more better approach, "hSacn" or "hGetAll"
      // https://stackoverflow.com/questions/42954943/node-js-redis-get-all-values-in-a-hashmap
      // https://stackoverflow.com/questions/8086448/parse-redis-hgetall-object-in-node-js
      const viewCountsInfo = await redisClient.hScan("viewCounts", 0);

      await Promise.all(
        viewCountsInfo.tuples.map(async (target) => {
          await Feed.updateOne(
            { _id: target.field },
            { $inc: { view: parseInt(target.value, 10) } }
          );

          await redisClient.hDel("viewCounts", target.field);
        })
      );
    } catch (err) {
      await redisClient.disconnect();
      throw new Error(err.message);
    }

    await redisClient.disconnect();
  });
};

export default viewCountScheduler;
