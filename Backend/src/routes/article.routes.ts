import { Router, type Request, type Response, type NextFunction } from "express";
import {
  createArticle,
  createArticleComment,
  deleteArticle,
  deleteArticleComment,
  getArticleBySlug,
  getSimilarArticles,
  listArticleComments,
  listArticlesAdmin,
  listPublishedArticles,
  updateArticle,
} from "../controllers/article.controllers.js";
import { isAuthenticated, authorizedRoles } from "../middlewares/auth.middleware.js";
import { uploadArticleCover } from "../middlewares/upload.middleware.js";

const router = Router();

const runUpload =
  (middleware: (req: Request, res: Response, next: NextFunction) => void) =>
  (req: Request, res: Response, next: NextFunction) => {
    middleware(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  };

router.get("/", listPublishedArticles);
router.get("/admin", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), listArticlesAdmin);
router.get("/:slug/similar", getSimilarArticles);
router.get("/:slug/comments", listArticleComments);
router.post("/:slug/comments", createArticleComment);
router.delete("/comments/:id", isAuthenticated, deleteArticleComment);
router.get("/:slug", isAuthenticated, getArticleBySlug);
router.post("/", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), runUpload(uploadArticleCover), createArticle);
router.patch("/:id", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), runUpload(uploadArticleCover), updateArticle);
router.delete("/:id", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), deleteArticle);

export default router;
