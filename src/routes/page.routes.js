// backend/routes/page.routes.js
import { Router } from "express";
import {
    createPage,
    getPages,
    getPage,
    updatePage,
    deletePage,
    getPagesPublic,
    getPagePublic
} from "../controllers/page.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";
import { PERMISSIONS } from "../config/roles.js";

const router = Router();

router.route("/public").get(getPagesPublic);
router.route("/public:slug").get(getPagePublic);

router.use(verifyJWT, authorizeRoles(PERMISSIONS.CAN_MANAGE_CONTENT));

router.route("/").get(getPages).post(createPage);

router.route("/:id").get(getPage).patch(updatePage).delete(deletePage);

export default router;
