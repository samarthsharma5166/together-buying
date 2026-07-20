import multer from "multer";
import path from "path";
import fs from "fs";
import AppError from "../utils/error.utils.js";

const UPLOAD_DIR = "uploads";

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File Filter (Image only)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif", "image/heic", "image/heif", "image/avif"];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Only images (jpeg, jpg, png, webp, gif) are allowed", 400));
  }
};

// Set limits (5MB per image)
const limits = {
  fileSize: 5 * 1024 * 1024,
};

export const upload = multer({
  storage,
  fileFilter,
  limits,
});

// Middleware specifically for developer logo & bannerImage
export const uploadDeveloperFiles = upload.fields([
  { name: "logo", maxCount: 10 },
  { name: "bannerImage", maxCount: 10 },
]);

// Middleware specifically for uploading multiple property images
export const uploadPropertyImages = upload.array("images", 10);

// Hero section slides (larger limit for high-res property photos)
const heroLimits = { fileSize: 15 * 1024 * 1024 };
export const uploadHeroSlides = multer({ storage, fileFilter, limits: heroLimits }).array("images", 20);
export const uploadHeroSlideImage = multer({ storage, fileFilter, limits: heroLimits }).single("image");
export const uploadArticleCover = multer({ storage, fileFilter, limits: heroLimits }).single("coverImage");
export const uploadBlogCover = multer({ storage, fileFilter, limits: heroLimits }).single("coverImage");
export const uploadBlogImage = multer({ storage, fileFilter, limits: heroLimits }).single("image");

const videoFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif", "image/heic", "image/heif", "image/avif"];
  const videoTypes = ["video/mp4", "video/webm", "video/quicktime", "video/ogg"];
  if (imageTypes.includes(file.mimetype) || videoTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new AppError("Only images or videos (mp4, webm, mov, ogg) are allowed", 400));
};

const showcaseLimits = { fileSize: 80 * 1024 * 1024 };
export const uploadShowcaseVideoFiles = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: showcaseLimits,
}).fields([
  { name: "video", maxCount: 1 },
  { name: "poster", maxCount: 1 },
]);
