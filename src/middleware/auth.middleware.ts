import { getSession } from "@auth/express";
import { authConfig } from "../config/auth.config.js";
import type { NextFunction, Request, Response } from "express";

export const authenticateUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const session =
        res.locals.session ?? (await getSession(req, authConfig)) ?? undefined;

    res.locals.session = session;

    if (session) {
        return next();
    }

    res.status(401).json({ message: "Not Authenticated" });
};

export const currentSession = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const session = (await getSession(req, authConfig)) ?? undefined;
    res.session = session;

    return next();
};
