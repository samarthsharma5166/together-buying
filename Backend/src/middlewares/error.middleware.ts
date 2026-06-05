import type { NextFunction, Request, Response } from "express";

type ErrorType = {
  message: string;
  statusCode: number;
  stack: string;
}

const errorMiddleware = (error: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'something went wrong';

  if (error.name === "ZodError") {
    statusCode = 400;
    if (error.errors && Array.isArray(error.errors)) {
      message = error.errors.map((e: any) => `${e.path.join(".")}: ${e.message}`).join(", ");
    }
  } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    message = `Unexpected file field: "${error.field}". Please verify that this field name matches the accepted API parameters.`;
    statusCode = 400;
  }

  return res.status(statusCode).json({
    success: false,
    message: message,
    stack: error.stack
  });
}

export default errorMiddleware;