import { Router } from "express";
import {
  getYoutubeChannel,
  getYoutubeChannelAdmin,
  updateYoutubeChannel,
} from "../controllers/youtubeChannel.controllers.js";
import { isAuthenticated, authorizedRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", getYoutubeChannel);
router.get("/admin", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), getYoutubeChannelAdmin);
router.patch("/", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), updateYoutubeChannel);

export default router;
