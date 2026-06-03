import { Router } from "express";
import { login, register, logout, me } from "../controllers/auth.controllers.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
const router = Router();
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", isAuthenticated, me);
export default router;
//# sourceMappingURL=auth.routes.js.map