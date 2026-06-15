import { Router } from "express";
import {
  listSubscriptionPlans,
  getSubscriptionPlan,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan
} from "../controllers/subscriptionPlan.controllers.js";
import { isAuthenticated, authorizedRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// Retrieving routes can be accessed by any authenticated user
router.get("/", listSubscriptionPlans);
router.get("/:id", isAuthenticated, getSubscriptionPlan);

// Mutation routes are protected for Admin and Super Admin only
router.post("/", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), createSubscriptionPlan);
router.patch("/:id", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), updateSubscriptionPlan);
router.delete("/:id", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), deleteSubscriptionPlan);

export default router;
