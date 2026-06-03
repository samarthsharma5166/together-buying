import { Router } from "express";
import {
  createProperty,
  getProperty,
  updateProperty,
  listProperties,
  deleteProperty,
  uploadPropertyImages,
  deletePropertyImage,
  getFeaturedProperties,
  toggleFeatured,
  updatePossessionStatus,
} from "../controllers/property.controllers.js";
import { isAuthenticated, authorizedRoles } from "../middlewares/auth.middleware.js";
import { uploadPropertyImages as uploadPropertyImagesMiddleware } from "../middlewares/upload.middleware.js";

const router = Router();

// Public routes
router.get("/featured", getFeaturedProperties);
router.get("/", listProperties);
router.get("/:idOrSlug", getProperty);

// Admin-only routes
router.post("/", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), createProperty);
router.patch("/:id", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), updateProperty);
router.delete("/archived/:id", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), deleteProperty);

// Dedicated Property Image management routes
router.post("/:propertyId/images", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), uploadPropertyImagesMiddleware, uploadPropertyImages);
router.delete("/images/:imageId", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), deletePropertyImage);

// Status updates
router.patch("/:id/featured", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), toggleFeatured);
router.patch("/:id/possession-status", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), updatePossessionStatus);

export default router;
