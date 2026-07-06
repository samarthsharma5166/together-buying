// package import
import express from 'express'
import dotenv from 'dotenv'

// routes import 
import authrouter from './routes/auth.routes.js'
import developerRouter from './routes/developer.routes.js'
import propertyRouter from './routes/property.routes.js'
import rmRouter from './routes/rm.routes.js'
import groupRouter from './routes/group.routes.js'
import subscriptionPlanRouter from './routes/subscriptionPlan.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'
import transectionRouter from './routes/transection.routes.js'
import heroSlideRouter from './routes/heroSlide.routes.js'
import showcaseVideoRouter from './routes/showcaseVideo.routes.js'
import blogRouter from './routes/blog.routes.js'

// middleware import
import cookieParser from 'cookie-parser'
import errorMiddleware from './middlewares/error.middleware.js'
import cors from 'cors'

dotenv.config()

const app = express();

// middleware configuration
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// health check route 
app.get("/helth",(req,res)=>{
    res.status(200).json({
        success:true,
        message:"Everything is working fine"
    })
})


// static file serving
app.use("/uploads", express.static("uploads"))


// api routes 
app.use("/api/auth", authrouter)
app.use("/api/developers", developerRouter)
app.use("/api/properties", propertyRouter)
app.use("/api/rm",rmRouter)
app.use("/api/groups", groupRouter)
app.use("/api/subscription-plans", subscriptionPlanRouter)
app.use("/api/subscriptions", subscriptionRouter)
app.use("/api/transections", transectionRouter)
app.use("/api/hero-slides", heroSlideRouter)
app.use("/api/showcase-videos", showcaseVideoRouter)
app.use("/api/blogs", blogRouter)



// 404 handler 
app.all('*splat', (req, res) => {
  res.status(404).send("oops! page not found ");
});

// global error handler
app.use(errorMiddleware);

export default app;