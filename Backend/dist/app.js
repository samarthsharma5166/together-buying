import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authrouter from './routes/auth.routes.js';
import errorMiddleware from './middlewares/error.middleware.js';
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// health check route 
app.get("/helth", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Everything is working fine"
    });
});
// auth routes 
app.post("/api/auth", authrouter);
app.all('*', (req, res) => {
    res.status(404).send("oops! page not found ");
});
app.use(errorMiddleware);
export default app;
//# sourceMappingURL=app.js.map