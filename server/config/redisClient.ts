
import { createClient } from "redis";
import { env } from "../envs/env";


const redis = createClient({
  url: env.REDIS_URL,
  //use username and password if it not is in the REDIS_URL
});

redis.on("error", (err) => console.error("Redis error:", err));

export async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}

export default redis;