import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";
import { PERMISSIONS } from "../config/roles.js";

import {
    submitContactQuery,
    getContactQueries,
    getContactQueryById,
    updateContactQuery,
    deleteContactQuery
} from "../controllers/contact.controller.js";

const router = Router();

router.route("/public").post(submitContactQuery);

router.use(verifyJWT, authorizeRoles(PERMISSIONS.CAN_MANAGE_INQUIRIES));

router.route("/")
    .get(getContactQueries);

router.route("/:id")
    .get(getContactQueryById)
    .patch(updateContactQuery)
    .delete(deleteContactQuery);

export default router;