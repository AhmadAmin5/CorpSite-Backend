import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

import upload from "../middlewares/multer.middleware.js";

import { uploadMedia, getMedia, deleteMedia } from "../controllers/media.controller.js";

const router = Router();

router.use(verifyJWT, authorizeRoles("admin", "manager"));

router.route("/").get(getMedia).post(upload.single("file"), uploadMedia);

router.route("/:id").delete(deleteMedia);

export default router;
