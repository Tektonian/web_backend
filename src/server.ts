import app from ".";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import { currentSession } from "./middleware/auth.middleware";
import { __initChat } from "./routes/chat/webSocketRouter";
// TODO: Error handling for chat is needed
import errorHandleMiddleware from "./middleware/error.middleware";
import logger from "./utils/logger";

const httpServer = createServer(app);
// Init socket.io server
const io = new SocketServer(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    },
    path: "/api/chat",
});

logger.info("Initialized Socket io");

// set user and chatroom datas on socket instance
io.use((socket, next) => {
    // chatRoom will be set 'join' event
    socket.data.chatRoom = null;
    // TODO: should add protocol to get session -> change later
    socket.request.protocol = "ws";
    currentSession(socket.request, socket.request, next);
});
__initChat(io);

// TODO: add schedule later
// __initSchedule();

// Listen server
httpServer.listen(process.env.PORT, () => {
    logger.info(`Server is running on port ${process.env.PORT}`);
});
