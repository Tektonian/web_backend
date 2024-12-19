import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { sequelize } from "./models/rdbms";
import { ExpressAuth } from "@auth/express";
import { authConfig } from "./config/auth.config";
import { currentSession } from "./middleware/auth.middleware";
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
import __initChat from "./routes/chat/webSocketRouter";
import { __initSchedule } from "./utils/schedule";
import { chatTest } from "./dummyChatData";
import * as rTracer from "cls-rtracer";

import logger from "./utils/logger";
const ErrorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.stack);
    res.json();
};

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
app.use(currentSession);
app.use(
    rTracer.expressMiddleware({
        requestIdFactory: (req: Request) => ({
            id: crypto.randomUUID(),
            glbTraceId: req.headers["x-global-trace-id"] ?? "",
            userId: req.uuid ?? "",
        }),
    }),
);

sequelize
    .sync({ force: false })
    .then(() => {
        logger.info("Database connection success");
    })
    .catch((err) => {
        logger.error("Database connection failed:", err);
    });

/**
 * User Signin / Login
 */
// Authenticate
app.use("/api/auth/*", ExpressAuth(authConfig));

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
chatTest();
// Alarm and Chat data
app.use("/api/sse", SSEAlarmRouter);
app.use("/api/message", ChatRouter);

/*
    app.use(express.static(path.join(__dirname, "./../build")));
    app.get("/*", (req, res) => {
        res.sendFile(path.join(__dirname, "./../build/index.html"));
        });
    */

app.use(ErrorMiddleware);

export default app;
