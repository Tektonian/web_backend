import { Server } from "socket.io";
import { currentSession } from "../middleware/auth.middleware";
import * as chatController from "../controllers/chat/chat";
import { models } from "../models";
export default function initChat(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:3000",
            credentials: true,
        },
        path: "/api/chat",
    });

    io.engine.use(currentSession);

    io.use((socket, next) => {
        console.log("Socket", socket.request.user);
        next();
    });

    io.on("connection", async (socket) => {
        console.log("User connected");
        socket.on("join", (val) => {
            console.log("Join room ", val);
            socket.join(val);
        });

        socket.on("sendMessage", async (recv, callback) => {
            console.log(recv);
            const { chatRoomId, message } = JSON.parse(recv);
            const messagePool =
                await chatController.getChatRoomMessages(chatRoomId);
            console.log("messagePool", messagePool);
            if (messagePool !== undefined) {
                // message DB 업데이터
                const user = await models.User.findOne({
                    where: { email: message.senderName },
                    attributes: ["user_id", "username", "email"],
                });
                await chatController.sendMessage(
                    chatRoomId,
                    user?.dataValues,
                    message.content,
                );
                // 잘 받았다고 전달 - 클라이언트 전송 중에서 전동 완료로 바꿀 수 있게
                const response = socket.emit(
                    "checkReceived",
                    JSON.stringify({ res: "ok", message: message }),
                );
                socket.emit("response ", response);
                console.log("callback", callback);
                callback(JSON.stringify(message));
            } else {
                alert("Chatroom not exist!");
                return;
            }
            socket
                .in(chatRoomId)
                .emit("respondMessage", JSON.stringify(message));
        });

        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });

    return io;
}
