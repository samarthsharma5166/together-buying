import { Router } from "express";
import {
  createProperty,
  getProperty,
  updateProperty,
  listProperties,
  deleteProperty,
} from "../controllers/property.controllers.js";
import { isAuthenticated, authorizedRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.get("/", listProperties);
router.get("/:idOrSlug", getProperty);

// Admin-only routes
router.post("/", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), createProperty);
router.patch("/:id", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), updateProperty);
router.delete("/:id", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), deleteProperty);

export default router;
