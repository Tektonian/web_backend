import type { NextFunction, Request, RequestHandler, Response } from "express";

import { getSession } from "@auth/express";
import { authConfig } from "../config/auth.config.js";

import { UserEnum } from "api_spec/enum";
import * as Errors from "../errors";
import logger from "../utils/logger.js";

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
    const session = res.locals.session ?? (await getSession(req, authConfig)) ?? undefined;
    res.locals.session = session;

    if (session) {
        return next();
    }
    res.status(401).json({ message: "Not Authenticated" });
};

export const currentSession = async (req: Request, res: Response, next: NextFunction) => {
    const session = (await getSession(req, authConfig)) ?? undefined;
    // init as undefined
    res.session = undefined;
    req.uuid = undefined;
    // console.log("currentSession", session);
    // encode JSON.stringfied Buffer to Buffer
    // https://stackoverflow.com/questions/34557889/how-to-deserialize-a-nested-buffer-using-json-parse
    if (session !== undefined && session.user !== undefined && session.user.id !== undefined) {
        res.session = {
            user: {
                ...session.user,
                id: Buffer.from(session.user.id.data),
            },
        };
        const str = Buffer.from(session.user.id.data).toString("hex");
        req.uuid = `${str.slice(0, 8)}-${str.slice(8, 12)}-${str.slice(12, 16)}-${str.slice(16, 20)}-${str.slice(20)}`;
    }

    return next();
};

/**
 * Filter logined user and user_roles.
 * Non authorized access will be handled at error.middleware.ts
 * @param roles - User roles. Ex) ['corp', 'normal'] / undefined means only check login session
 */
export const filterSessionByRBAC = (roles?: UserEnum.USER_ROLE_ENUM[]) => {
    const callback: RequestHandler<any, any, any, any> = (req: Request, res: Response, next: NextFunction) => {
        const sessionUser = res.session?.user;
        // Check session
        if (sessionUser === undefined) {
            throw new Errors.ServiceExceptionBase("Un-Logined user tried to access");
        }
        if (roles === undefined) {
            next();
        }

        const userRoleSet = new Set(sessionUser.roles);
        const authRoleSet = new Set(roles);

        if (userRoleSet.intersection(authRoleSet).size === 0) {
            throw new Errors.ServiceExceptionBase(`User tried unathorized access: User: ${sessionUser}`);
        }

        next();
    };

    return callback;
};
