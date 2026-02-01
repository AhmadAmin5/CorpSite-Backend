import { PERMISSIONS } from "../config/roles.js";

import { Router } from "express";
import { createPost, getPosts, getPost, updatePost, deletePost } from "../controllers/post.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = Router();

router.route("/:id").get(getPost);

router.use(verifyJWT, authorizeRoles(PERMISSIONS.CAN_EDIT_CONTENT));

router.route("/").get(getPosts).post(createPost);

router.route("/:id").patch(updatePost).delete(deletePost);

export default router;
