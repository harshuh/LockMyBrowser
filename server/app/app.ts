import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "../envs/env";
import { errorHandler } from "../middleware/globalErrorHandler";

import userRoutes from "../modules/user/user.routes"
import { connectRedis } from "../config/redisClient";

export const app = express();

app.use(cors())
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));


// Status Api :)
app.get('/status', (_req, res) => {
  res.status(200).json({ status: 'ok',env: env.NODE_ENV, message:'Working Fine You can Sleep !!'});
});

// Main APIs
app.use('/api/v1/user', userRoutes)


// GlobalErrHandler
app.use(errorHandler)


const PORT = Number(env.PORT) || 8000;

async function startServer() {
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();