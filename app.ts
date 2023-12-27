// reference
// https://freestrokes.tistory.com/154

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "fs";
import https from "https";
import "express-async-errors";

import { swaggerUi, spec } from "./swagger/swagger";

import AuthRouter from "./routes/authRouter";
import FeedRouter from "./routes/feedRouter";
import CommentRouter from "./routes/commentRouter";
import SubCommentRouter from "./routes/subCommentRouter";
import UserRouter from "./routes/userRouter";
import LocationRouter from "./routes/locationRouter";

import viewCountScheduler from "./schedulers/viewCountScheduler";

import errorMiddleware from "./middlewares/errorMiddleware";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;

const options = {
  key: fs.readFileSync("./localhost-back-key.pem"),
  cert: fs.readFileSync("./localhost-back-cert.pem"),
};

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://localhost:3001"],
    credentials: true,
  })
);

app.listen(PORT, () => {
  viewCountScheduler();
});

// https.createServer(options, app).listen(PORT);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PSWD}@cluster0.imx8ztj.mongodb.net/`
  )
  .then(() => {
    console.log("Connect Success!");
  })
  .catch((err) => {
    console.log("Connect Fail...", err);
  });

app.use("/api/auth", AuthRouter);
app.use("/api/feed", FeedRouter);
app.use("/api/comment", CommentRouter);
app.use("/api/subcomment", SubCommentRouter);
app.use("/api/user", UserRouter);
app.use("/api/location", LocationRouter);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(spec, { explorer: true })
);
app.use(errorMiddleware);
