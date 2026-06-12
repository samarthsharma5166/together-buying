import { Router } from "express";
import {
  listGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  listRMs,
  getUnassignedProperties,
  getAssignedProperties
} from "../controllers/group.controllers.js";
import { isAuthenticated, authorizedRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply auth middleware to all group management routes
router.use(isAuthenticated);
router.use(authorizedRoles("ADMIN", "SUPER_ADMIN"));

router.get("/", listGroups);
router.get("/rms", listRMs);
router.get("/unassigned-properties", getUnassignedProperties);
router.get("/assigned-properties", getAssignedProperties);
router.get("/:id", getGroup);
router.post("/", createGroup);
router.patch("/:id", updateGroup);
router.delete("/:id", deleteGroup);

export default router;
