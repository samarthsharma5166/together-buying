import { Router } from "express";
import { checkoutSubscription, handleWebhook, mockCompleteSubscription, verifySubscriptionPayment } from "../controllers/subscription.controllers.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/checkout", isAuthenticated, checkoutSubscription);
// Commented out webhook for development and callback-based verification
// router.post("/webhook", handleWebhook);
router.post("/verify", isAuthenticated, verifySubscriptionPayment);
router.post("/mock-complete", isAuthenticated, mockCompleteSubscription);

export default router;
