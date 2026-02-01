import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import { PERMISSIONS } from "../config/roles.js";

import { uploadMedia, getMedia, deleteMedia } from "../controllers/media.controller.js";

const router = Router();

router.use(verifyJWT, authorizeRoles(PERMISSIONS.CAN_MANAGE_MEDIA));

router.route("/").get(getMedia).post(upload.single("file"), uploadMedia);

router.route("/:id").delete(deleteMedia);

export default router;
