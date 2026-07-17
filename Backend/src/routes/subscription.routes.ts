import { Router } from "express";
import { checkoutSubscription, getMySubscriptions, handleWebhook, mockCompleteSubscription, verifySubscriptionPayment } from "../controllers/subscription.controllers.js";
import { authorizedRoles, isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/my-subscriptions", isAuthenticated, getMySubscriptions);
router.post("/checkout", isAuthenticated,authorizedRoles("USER"),checkoutSubscription);
// Commented out webhook for development and callback-based verification
// router.post("/webhook", handleWebhook);
router.post("/verify", isAuthenticated, verifySubscriptionPayment);
router.post("/mock-complete", isAuthenticated, mockCompleteSubscription);

export default router;
