import { Router, type NextFunction, type Request, type Response } from "express";
import {
  createShowcaseVideo,
  deleteShowcaseVideo,
  listShowcaseVideos,
  listShowcaseVideosAdmin,
  updateShowcaseVideo,
} from "../controllers/showcaseVideo.controllers.js";
import { isAuthenticated, authorizedRoles } from "../middlewares/auth.middleware.js";
import { uploadShowcaseVideoFiles } from "../middlewares/upload.middleware.js";

const router = Router();

const runUpload =
  (middleware: (req: Request, res: Response, next: NextFunction) => void) =>
  (req: Request, res: Response, next: NextFunction) => {
    middleware(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  };

router.get("/", listShowcaseVideos);
router.get("/admin", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), listShowcaseVideosAdmin);
router.post("/", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), runUpload(uploadShowcaseVideoFiles), createShowcaseVideo);
router.patch("/:id", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), runUpload(uploadShowcaseVideoFiles), updateShowcaseVideo);
router.delete("/:id", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), deleteShowcaseVideo);

export default router;
