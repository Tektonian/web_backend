import { getSession } from "@auth/express";
import { authConfig } from "../config/auth.config.js";
export const authenticateUser = async (req, res, next) => {
    const session = res.locals.session ?? (await getSession(req, authConfig)) ?? undefined;
    res.locals.session = session;
    if (session) {
        return next();
    }
    res.status(401).json({ message: "Not Authenticated" });
};
export const currentSession = async (req, res, next) => {
    const session = (await getSession(req, authConfig)) ?? undefined;
    res.session = session;
    // encode JSON.stringfied Buffer to Buffer
    // https://stackoverflow.com/questions/34557889/how-to-deserialize-a-nested-buffer-using-json-parse
    console.log("currentSEssion", session);
    if (session !== undefined &&
        session.user !== undefined &&
        session.user.id !== undefined) {
        res.session.user.id = Buffer.from(session.user?.id.data);
    }
    return next();
};
