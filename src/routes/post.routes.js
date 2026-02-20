import { PERMISSIONS } from "../config/roles.js";

import { Router } from "express";
import {
    createPost,
    getPosts,
    getPost,
    updatePost,
    deletePost,
    getPostsPublic,
    getPostPublic
} from "../controllers/post.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = Router();

router.route("/public").get(getPostsPublic);
router.route("/public/:slug").get(getPostPublic);

router.use(verifyJWT, authorizeRoles(PERMISSIONS.CAN_MANAGE_CONTENT));

router.route("/").get(getPosts).post(createPost);

router.route("/:id").get(getPost).patch(updatePost).delete(deletePost);

export default router;
