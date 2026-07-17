import type { Request, Response, NextFunction } from "express";

type ControllerFunction = (
  req: Request,
  res: Response,
  
  next: NextFunction
) => Promise<any> | any;

export const tryCatch = <T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<any> | any
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as T, res, next)).catch(next);
  };
};
