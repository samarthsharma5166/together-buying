import { Router } from "express";
import { getMyGroups } from "../controllers/rm.controllers.js";
import { isAuthenticated, authorizedRoles } from "../middlewares/auth.middleware.js";

const rmRouter = Router();

// Gated routes for RMs and Admins
rmRouter.use(isAuthenticated);
rmRouter.use(authorizedRoles("RM", "ADMIN", "SUPER_ADMIN"));

rmRouter.get("/groups", getMyGroups);

export default rmRouter;