import type { Response, NextFunction } from "express";
import type { Request } from "express";
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        phone: string;
        role: string;
        firstName: string;
        lastName: string;
    };
}
export declare const isAuthenticated: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map