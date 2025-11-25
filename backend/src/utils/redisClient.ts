// import { createClient } from "redis";

// const isProd = process.env.NODE_ENV === "production";

// // Default dummy client for production if no Redis URL
// let redisClient: any;

// if (isProd && !process.env.REDIS_URL) {
//   console.log(" Redis disabled in production");
//   // Dummy methods to avoid breaking code
//   redisClient = {
//     get: async () => null,
//     set: async () => {},
//      setEx: async () => {},
//     del: async () => {},
//   };
// } else {
//   const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
//   redisClient = createClient({ url: redisUrl });

//   redisClient.on("connect", () => {
//     console.log(" Redis connected successfully");
//   });

//   redisClient.on("error", (err: string) => {
//     console.error("Redis error:", err);
//   });

//   (async () => {
//     await redisClient.connect();
//   })();
// }

// export default redisClient;
