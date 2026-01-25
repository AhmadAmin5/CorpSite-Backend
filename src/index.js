import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";
import logger from "./utils/logger.js";

dotenv.config();

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
