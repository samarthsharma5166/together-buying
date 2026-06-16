import { Router } from "express";
import {
  listGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  listRMs,
  getUnassignedProperties,
  getAssignedProperties,
  joinGroup,
  leaveGroup,
  getGroupMembershipStatus,
  getMyParticipationGroups
} from "../controllers/group.controllers.js";
import { isAuthenticated, authorizedRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Group membership routes (accessible by premium/admin users)
router.get("/user/my-groups", getMyParticipationGroups);
router.post("/:groupId/join", authorizedRoles("BUYER_PREMIUM", "RM", "ADMIN", "SUPER_ADMIN"), joinGroup);
router.post("/:groupId/leave", authorizedRoles("BUYER_PREMIUM", "RM", "ADMIN", "SUPER_ADMIN"), leaveGroup);
router.get("/:groupId/membership-status", getGroupMembershipStatus);

// Apply admin role gating to administrative management routes
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
