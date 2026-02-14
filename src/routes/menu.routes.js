import { Router } from "express";
import {
    createMenu,
    getAllMenus,
    getMenuBySlug,
    updateMenu,
    deleteMenu
} from "../controllers/menu.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";
import { PERMISSIONS } from "../config/roles.js";

const router = Router();

router.route("/public/:slug").get(getMenuBySlug);

router.use(verifyJWT, authorizeRoles(PERMISSIONS.CAN_MANAGE_CONTENT));

router.route("/").get(getAllMenus).post(createMenu);
router.route("/:id").patch(updateMenu).delete(deleteMenu);

export default router;