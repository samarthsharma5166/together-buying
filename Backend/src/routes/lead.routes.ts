import { Router } from "express";
import { createLead, getMyLeads, getLeadDetails, updateLead, addLeadNote } from "../controllers/lead.controllers.js";
import { isAuthenticated, authorizedRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", createLead);

// Gated routes for RMs and Admins
router.use(isAuthenticated);
router.use(authorizedRoles("RM", "ADMIN", "SUPER_ADMIN"));

router.get("/", getMyLeads);
router.get("/:id", getLeadDetails);
router.patch("/:id", updateLead);
router.post("/:id/notes", addLeadNote);

export default router;
