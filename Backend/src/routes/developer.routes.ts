import { Router } from "express";
import {
  createDeveloper,
  getDeveloper,
  updateDeveloper,
  listDevelopers,
  deleteDeveloper,
} from "../controllers/developer.controllers.js";
import { isAuthenticated, authorizedRoles } from "../middlewares/auth.middleware.js";
import { uploadDeveloperFiles } from "../middlewares/upload.middleware.js";

const router = Router();

// Public routes
router.get("/", listDevelopers);
router.get("/:idOrSlug", getDeveloper);

// Admin-only routes
router.post("/", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), uploadDeveloperFiles, createDeveloper);
router.patch("/:id", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), uploadDeveloperFiles, updateDeveloper);
router.delete("/terminate/:id", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), deleteDeveloper);

export default router;
