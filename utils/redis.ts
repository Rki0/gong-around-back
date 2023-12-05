import { createClient } from "redis";

const connectRedis = async () => {
  let redisClient;

  try {
    redisClient = await createClient({
      password: process.env.REDIS_PSWD,
      socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT as unknown as number,
      },
    })
      .on("error", (err) => console.log("Redis Client Error", err))
      .connect();
  } catch (err) {
    throw new Error("Redis 연결 실패");
  }

  return redisClient;
};

export default connectRedis;
