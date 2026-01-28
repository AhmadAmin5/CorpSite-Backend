import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./utils/errorHandler.js";

const app = express();

app.use(cors({ credentials: true, origin: process.env.CORS_ORIGIN }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import

import userRouter from "./routes/user.routes.js";

// routes declaration

app.use("/api/v1/user", userRouter);

app.use(errorHandler);

export default app;
