import { Router } from "express";
import {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
} from "../controllers/category.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";
import { PERMISSIONS } from "../config/roles.js";

const router = Router();

router.route("/").get(getCategories);

router.use(verifyJWT, authorizeRoles(PERMISSIONS.CAN_MANAGE_CONTENT));

router.route("/").post(createCategory);

router.route("/:id").patch(updateCategory).delete(deleteCategory);

export default router;
