import { Router } from "express";
import { getMyTransections } from "../controllers/transection.controllers.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", isAuthenticated, getMyTransections);

export default router;
