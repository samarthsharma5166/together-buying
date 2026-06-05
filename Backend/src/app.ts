import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import authrouter from './routes/auth.routes.js'
import developerRouter from './routes/developer.routes.js'
import propertyRouter from './routes/property.routes.js'
import errorMiddleware from './middlewares/error.middleware.js'
import cors from 'cors'

dotenv.config()

const app = express();

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

// routes 
app.use("/api/auth", authrouter)
app.use("/api/developers", developerRouter)
app.use("/api/properties", propertyRouter)



app.all('*splat', (req, res) => {
  res.status(404).send("oops! page not found ");
});
app.use(errorMiddleware);

export default app;