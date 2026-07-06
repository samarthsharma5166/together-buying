import { Router, type Request, type Response, type NextFunction } from "express";
import {
  createHeroSlides,
  deleteHeroSlide,
  listHeroSlides,
  listHeroSlidesAdmin,
  updateHeroSlide,
} from "../controllers/heroSlide.controllers.js";
import { isAuthenticated, authorizedRoles } from "../middlewares/auth.middleware.js";
import { uploadHeroSlideImage, uploadHeroSlides } from "../middlewares/upload.middleware.js";

const router = Router();

const runUpload =
  (middleware: (req: Request, res: Response, next: NextFunction) => void) =>
  (req: Request, res: Response, next: NextFunction) => {
    middleware(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  };

router.get("/", listHeroSlides);
router.get("/admin", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), listHeroSlidesAdmin);
router.post("/", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), runUpload(uploadHeroSlides), createHeroSlides);
router.patch("/:id", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), runUpload(uploadHeroSlideImage), updateHeroSlide);
router.delete("/:id", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), deleteHeroSlide);

export default router;
