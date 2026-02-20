import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./utils/errorHandler.js";
import ApiVersion from "./config/ApiVersion.js";

const app = express();

app.use(cors({ credentials: true, origin: process.env.CORS_ORIGIN }));
app.use(express.json({ limit: "32mb" }));
app.use(express.urlencoded({ extended: true, limit: "32mb" }));
app.use(express.static("public"));
app.use(cookieParser());

// app.use((req, res, next) => {
//     console.log(`Delaying request to ${req.url} for 3 seconds...`);
//     setTimeout(() => {
//         next();
//     }, 5000);
// });

app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is awake' });
});

// routes import

import authRoutes from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import mediaRouter from "./routes/media.routes.js";
import postRouter from "./routes/post.routes.js";
import categoryRouter from "./routes/category.routes.js";
import pageRouter from "./routes/page.routes.js";
import settingRouter from "./routes/setting.routes.js";
import menuRouter from "./routes/menu.routes.js";

// routes declaration

app.use(ApiVersion + "/auth", authRoutes);
app.use(ApiVersion + "/user", userRouter);
app.use(ApiVersion + "/media", mediaRouter);
app.use(ApiVersion + "/post", postRouter);
app.use(ApiVersion + "/category", categoryRouter);
app.use(ApiVersion + "/page", pageRouter);
app.use(ApiVersion + "/setting", settingRouter);
app.use(ApiVersion + "/menu", menuRouter);

app.use(errorHandler);

export default app;
