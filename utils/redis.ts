import { createClient } from "redis";

const connectRedis = async () => {
  const redisClient = await createClient({
    password: process.env.REDIS_PSWD,
    socket: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT as unknown as number,
    },
  })
    .on("error", (err) => console.log("Redis Client Error", err))
    .connect();

  return redisClient;
};

export default connectRedis;
