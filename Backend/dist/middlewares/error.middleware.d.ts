import type { NextFunction, Request, Response } from "express";
type ErrorType = {
    message: string;
    statusCode: number;
    stack: string;
};
declare const errorMiddleware: (error: ErrorType, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export default errorMiddleware;
//# sourceMappingURL=error.middleware.d.ts.map