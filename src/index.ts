import express, { NextFunction, Request, Response } from "express";
// External libraries
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ExpressAuth } from "@auth/express";
import { authConfig } from "./config/auth.config";
// Middleware
import { currentSession } from "./middleware/auth.middleware";
import errorHandleMiddleware from "./middleware/error.middleware";
// Router
import RequestRouter from "./routes/wiip/RequestRouter";
import StudentRouter from "./routes/wiip/StudentRouter";
import SchoolSearchRouter from "./routes/search/SchoolSearchRouter";
import ExamSearchRouter from "./routes/search/ExamSearchRouter";
import StudentReviewRouter from "./routes/wiip/StudentReviewRouter";
import CorporationRouter from "./routes/wiip/CorporationRouter";
import CorporationReviewRouter from "./routes/wiip/CorporationReviewRouter";
import RecommendRouter from "./routes/recommend/Recommend";
import VerificationRouter from "./routes/VerificationRouter";
import ChatRouter from "./routes/chat/chatRouter";
import SSEAlarmRouter from "./routes/chat/sseRouter";
// Initialize other services
import { __initSchedule } from "./utils/schedule";
// Dummy chat data
import { generateChatDummyData } from "./dummyChatData";
// Utilities
import { ServiceErrorBase } from "./errors";
import * as rTracer from "cls-rtracer";
import logger from "./utils/logger";

Error.stackTraceLimit = 999;
const app = express();
const PORT = process.env.PORT || 8080;

/**
 * Middlewares
 */
app.set("port", PORT);
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(currentSession);
app.use(
    rTracer.expressMiddleware({
        /** Add TraceId properties for log tracking -> @see {@link utils/logger.ts} */
        requestIdFactory: (req: Request) => ({
            id: crypto.randomUUID(),
            glbTraceId: req.headers["x-global-trace-id"] ?? "",
            platform: req.headers["wiip-platform"] ?? "",
            userId: req.uuid ?? "",
        }),
    }),
);

/**
 * User Signin / Login
 */
// Authenticate
app.use("/api/auth", ExpressAuth(authConfig));

/**
 * For GET and POST of Request / Profile / Review
 */
app.use("/api/requests", RequestRouter);
app.use("/api/students", StudentRouter);
app.use("/api/search/schools", SchoolSearchRouter);
app.use("/api/search/exams", ExamSearchRouter);
app.use("/api/student-reviews", StudentReviewRouter);
app.use("/api/corporations", CorporationRouter);
app.use("/api/corporation-reviews", CorporationReviewRouter);

/**
 * Verification router
 */
app.use("/api/verification", VerificationRouter);
/**
 * Recommendation server of meilisearch
 */
app.use("/api/recommend", RecommendRouter);

/**
 * For chatting
 */
// Init dummy chat data
new Promise((resolve, reject) => generateChatDummyData());
// Alarm and Chat data
app.use("/api/sse", SSEAlarmRouter);
app.use("/api/message", ChatRouter);
app.get("/", async (req, res) => {
    res.redirect(`wiip://callback?session=${JSON.stringify(cookie.parse(req.headers.cookie ?? ""))}`);
    console.log(req.headers);
    throw new ServiceErrorBase("This is for testing error");
});
app.get("/redirect", async (req, res) => {
    logger.info(`${JSON.stringify(req.headers)} / ${JSON.stringify(req.query)}`);

    const { redirectType, redirectUrl } = req.query;

    const cookieUrl: string | undefined = req.cookies["authjs.callback-url"];
    logger.info(`Cookie url: ${cookieUrl}`);
    if (!cookieUrl) {
        logger.error(`Cookie url not exist`);
        res.redirect("http://localhost:3000/home");
        return;
    }

    const callbackUrl = new URL(cookieUrl);
    logger.info(`callbackUrl: ${callbackUrl}`);

    if (!callbackUrl || callbackUrl.host !== req.host) {
        logger.error(`Wrong callback url ${req.originalUrl} - ${req.baseUrl}`);
        res.redirect("http://localhost:3000/home");
        return;
    }

    const cookieRedirectType = callbackUrl.searchParams.get("redirectType");
    const cookieRedirectUrl = callbackUrl.searchParams.get("redirectUrl");
    logger.info(`cookie values: ${cookieRedirectType} / ${cookieRedirectUrl}`);
    if (cookieRedirectType !== redirectType || cookieRedirectUrl !== redirectUrl) {
        logger.error(`Wrong cookie value`);
        res.redirect("http://localhost:3000/home");
        return;
    }

    if (redirectType === "signin") {
        res.redirect(`${redirectUrl}?session=${req.cookies["authjs.session-token"]}`);
    }
});

/**
 * Error handling
 */
app.use(errorHandleMiddleware);
/*
    app.use(express.static(path.join(__dirname, "./../build")));
    app.get("/*", (req, res) => {
        res.sendFile(path.join(__dirname, "./../build/index.html"));
        });
    */

export default app;
