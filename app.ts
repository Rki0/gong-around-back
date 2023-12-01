import express, { Request, Response, NextFunction } from "express";

import authRouter from "./routes/authRouter";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});

app.use("/api/auth", authRouter);
