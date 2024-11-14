import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { QueueEvents } from "bullmq";
import { createSession } from "better-sse";
import verificationRouter from "./routes/verificationRoute.js";
import { chatTest } from "./dbconfig/chatDatabase.js";
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

app.post("/chatRooms", async (req, res, next) => {
    const sessionUser = res.session.user;
    if (sessionUser === undefined) res.json("No session");
    const dbUserData = await models.User.findOne({
        where: { email: sessionUser.email },
        attributes: ["user_id", "username", "email"],
    });
    const chatRooms =
        await chatController.chatRoomController.getAllChatRoomsByUser(
            dbUserData?.dataValues,
        );

    const ResChatRoomFactory = async (chatRoom: IChatroom): ResChatRoom => {
        const consumer = await chatController.chatUserController.getUserByUUID(
            chatRoom.consumer_id,
        );
        const participants =
            await chatController.chatUserController.getUsersByUUID(
                chatRoom.participant_ids,
            );
        const consumerName = consumer?.username;
        const participantNames = participants.map((part) => part.username);
        const resChatroom: ResChatRoom = {
            chatRoomId: chatRoom._id.toString(),
            messageSeq: chatRoom.message_seq,
            consumerName: consumerName,
            providerNames: participantNames,
        };

        return resChatroom;
    };

    const resChatRooms = await Promise.all(
        chatRooms.map((chatRoom) => ResChatRoomFactory(chatRoom)),
    );
    res.json(resChatRooms);
});

app.post("/chatContents", async (req, res, next) => {
    const { chatroom_id } = req.body;
    const sessionUser = res.session.user;
    if (sessionUser === undefined) res.json("No session");
    const dbUserData = await models.User.findOne({
        where: { email: sessionUser.email },
        attributes: ["user_id", "username", "email"],
    });
    const messages =
        await chatController.chatContentController.getChatRoomMessagesBiz(
            chatroom_id,
            dbUserData?.dataValues,
        );
    res.json(messages);
});

app.get("/sse", async (req, res) => {
    const session = await createSession(req, res, {
        headers: { "access-control-allow-credentials": "true" },
    });

    const user = res.session?.user;
    if (user === undefined) return;

    const callback = ({ jobId, returnvalue }) => {
        console.log("sseEvent: ", session);
        session.push(returnvalue, "message");
    };
    console.log("SSE connected: ", user.id.toString("hex"));
    sseEvent.on(`${user.id.toString("hex")}`, callback);

    session.on("disconnected", () => {
        console.log("SSE disconnected");
        sseEvent.off(`${user.id.toString("hex")}`, callback);
    });
});

chatTest();

const httpServer = createServer(app);

//const io = initChat(httpServer);
httpServer.listen(8080);
