import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { QueueEvents } from "bullmq";
import { createSession } from "better-sse";
import verificationRouter from "./routes/verificationRoute.js";
import { chatTest } from "./dummyChatDatabase.js";
import { authConfig } from "./config/auth.config.js";
import { ExpressAuth } from "@auth/express";
import {
    currentSession,
    authenticateUser,
} from "./middleware/auth.middleware.js";

import { models } from "./models/rdbms";
import initChat from "./routes/chat/webSocketRouter.js";
import { createServer } from "http";
import { chatController } from "./controllers/chat/index.js";
import { ResChatRoom } from "./types/chat/chatRes.types.js";
import { IChatroom } from "./types/chat/chatSchema.types.js";
import { RecommendRouter } from "./routes/wiip/recommend.js";

const sseEvent = new QueueEvents("sendAlarm");

const app = express();
const PORT = process.env.PORT || 8080;
process.env.NODE_ENV = "production";
app.set("port", 3000);

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/requests", RecommendRouter);

app.use("/api/auth/*", ExpressAuth(authConfig));

/*
requestInfoSequelize
    .sync()
    .then(() => {
        console.log("RequestInfo database & tables synced successfully!");
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to sync database:", error);
    });
*/

app.use(currentSession);

// Routes
app.get("/protected", async ({ req, res, next }: netProps) => {
    res.json({ session: res.session });
});

app.use("/verification", verificationRouter);

app.get(
    "/api/protected",
    authenticateUser,
    async ({ req, res, next }: netProps) => {
        res.json(res.session);
    },
);

app.get("/", async ({ req, res, next }: netProps) => {
    res.json({
        title: "Express Auth Example",
        user: res.session?.user,
    });
});

app.get("/api/sse", async (req, res) => {
    const session = await createSession(req, res, {
        headers: { "access-control-allow-credentials": "true" },
    });
    const user = res.session?.user;
    if (user === undefined) return;

    const totalUnread =
        await chatController.chatUnreadController.getTotalUnreadCount(user.id);
    session.push({ unreadTotalCount: totalUnread });
    console.log("sse", user, totalUnread);
    const callback = ({ jobId, returnvalue }) => {
        // console.log("sseEvent: ", returnvalue);
        // returnvalue is already JSON.stringfied value
        // if you send returnvalue through SSE it will be JSON.stringfied once more
        // So unwrap(=JSON.parse) the data before send.
        session.push(JSON.parse(returnvalue), "alarm");
    };
    // console.log("SSE connected: ", user.id.toString("hex"));
    sseEvent.on(`${user.id.toString("hex")}`, callback);

    session.on("disconnected", () => {
        // console.log("SSE disconnected");
        sseEvent.off(`${user.id.toString("hex")}`, callback);
    });
});

// chatTest();

const httpServer = createServer(app);

const io = initChat(httpServer);
httpServer.listen(8080);
