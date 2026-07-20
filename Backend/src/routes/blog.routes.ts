import { Router, type Request, type Response, type NextFunction } from "express";
import {
  createBlog,
  createBlogComment,
  deleteBlog,
  deleteBlogComment,
  getBlogBySlug,
  getSimilarBlogs,
  listBlogComments,
  listBlogsAdmin,
  listPublishedBlogs,
  updateBlog,
  uploadBlogContentImage,
} from "../controllers/blog.controllers.js";
import { isAuthenticated, authorizedRoles } from "../middlewares/auth.middleware.js";
import { uploadBlogCover, uploadBlogImage } from "../middlewares/upload.middleware.js";

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
router.post(
  "/upload-image",
  isAuthenticated,
  authorizedRoles("ADMIN", "SUPER_ADMIN"),
  runUpload(uploadBlogImage),
  uploadBlogContentImage
);
router.get("/:slug/similar", getSimilarBlogs);
router.get("/:slug/comments", listBlogComments);
router.post("/:slug/comments", createBlogComment);
router.delete("/comments/:id", isAuthenticated, deleteBlogComment);
router.get("/:slug", getBlogBySlug);
router.post("/", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), runUpload(uploadBlogCover), createBlog);
router.patch("/:id", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), runUpload(uploadBlogCover), updateBlog);
router.delete("/:id", isAuthenticated, authorizedRoles("ADMIN", "SUPER_ADMIN"), deleteBlog);

export default router;
