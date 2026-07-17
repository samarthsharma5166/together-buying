import { Router } from "express";
import { getMyGroups, getGroupsSummary, updateGroupStatus } from "../controllers/rm.controllers.js";
import { isAuthenticated, authorizedRoles } from "../middlewares/auth.middleware.js";

const rmRouter = Router();

// Gated routes for RMs and Admins
rmRouter.use(isAuthenticated);
rmRouter.use(authorizedRoles("RM", "ADMIN", "SUPER_ADMIN"));

rmRouter.get("/groups/summary", getGroupsSummary);
rmRouter.get("/groups", getMyGroups);
rmRouter.patch("/groups/:id/status", updateGroupStatus);

export default rmRouter;