import dotenv from "dotenv/config";
import app from "./app.js";
import connectDB from "./db/index.js";
import logger from "./utils/logger.js";

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            logger.success(`Server listening on port ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        logger.error("MongoDB connection attempt failed\n" + error);
        process.exit(1);
    });
