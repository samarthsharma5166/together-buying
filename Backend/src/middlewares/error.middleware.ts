import type { NextFunction, Request, Response } from "express";

type ErrorType = {
  message: string;
  statusCode: number;
  stack: string;
}

const errorMiddleware = (error:ErrorType,req:Request,res:Response,next:NextFunction)=>{
  error.statusCode = error.statusCode || 500;
  error.message = error.message || 'something went wrong'
  return res.status(error.statusCode).json({
    success:false,
    message:error.message,
    stack:error.stack
  })
}

export default errorMiddleware;