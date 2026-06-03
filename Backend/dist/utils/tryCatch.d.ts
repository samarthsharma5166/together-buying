import type { Request, Response, NextFunction } from "express";
export declare const tryCatch: <T extends Request = Request>(fn: (req: T, res: Response, next: NextFunction) => Promise<any> | any) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=tryCatch.d.ts.map