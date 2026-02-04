import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./utils/errorHandler.js";
import ApiVersion from "./config/ApiVersion.js";

const app = express();

app.use(cors({ credentials: true, origin: process.env.CORS_ORIGIN }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import

import authRoutes from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import mediaRouter from "./routes/media.routes.js";
import postRouter from "./routes/post.routes.js";
import categoryRouter from "./routes/category.routes.js";
import pageRouter from "./routes/page.routes.js";

// routes declaration

app.use(ApiVersion + "/auth", authRoutes);
app.use(ApiVersion + "/user", userRouter);
app.use(ApiVersion + "/media", mediaRouter);
app.use(ApiVersion + "/post", postRouter);
app.use(ApiVersion + "/category", categoryRouter);
app.use(ApiVersion + "/page", pageRouter);

app.use(errorHandler);

export default app;
