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
  } else if (error.code === 'LIMIT_FILE_SIZE') {
    message = 'Image is too large. Maximum allowed size is 15MB per image.';
    statusCode = 400;
  } else if (error.code === 'LIMIT_FILE_COUNT' || error.code === 'LIMIT_FIELD_KEY' || error.code === 'LIMIT_FIELD_VALUE' || error.code === 'LIMIT_FIELD_COUNT' || error.code === 'LIMIT_PART_COUNT') {
    message = error.message || 'Upload limit exceeded.';
    statusCode = 400;
  } else if (error.statusCode) {
    statusCode = error.statusCode;
    message = error.message;
  }

  return res.status(statusCode).json({
    success: false,
    message: message,
    stack: error.stack
  });
}

export default errorMiddleware;