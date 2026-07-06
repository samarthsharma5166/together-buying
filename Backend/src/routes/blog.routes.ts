import { Router, type Request, type Response, type NextFunction } from "express";
import {
  createBlog,
  deleteBlog,
  getBlogBySlug,
  listBlogsAdmin,
  listPublishedBlogs,
  updateBlog,
} from "../controllers/blog.controllers.js";
import { isAuthenticated, authorizedRoles } from "../middlewares/auth.middleware.js";
import { uploadBlogCover } from "../middlewares/upload.middleware.js";

const router = Router();

const runUpload =
  (middleware: (req: Request, res: Response, next: NextFunction) => void) =>
  (req: Request, res: Response, next: NextFunction) => {
    middleware(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  };

router.get("/", listPublishedBlogs);
router.get("/admin", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), listBlogsAdmin);
router.get("/:slug", getBlogBySlug);
router.post("/", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), runUpload(uploadBlogCover), createBlog);
router.patch("/:id", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), runUpload(uploadBlogCover), updateBlog);
router.delete("/:id", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), deleteBlog);

export default router;
