import { Server } from "socket.io";
import { currentSession } from "../middleware/auth.middleware";
import { chatController } from "../controllers/chat";
import { models } from "../models";

<<<<<<< Updated upstream
=======
interface joinRequestProps {
    deviceLastSeq: number;
    chatRoomId: string;
}

interface messageResponseProps {
    messages: any[];
    lastReadSequences: number[];
}

// 메시지 전송 -> 큐 삽입 -> 룸 브로드케스팅 -> 리턴 (받았다고 표시) -> unread 수 전송
>>>>>>> Stashed changes
export default function initChat(httpServer) {
    const { chatContentController } = chatController;
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
<<<<<<< Updated upstream
        console.log("User connected");
        socket.on("join", (val) => {
            console.log("Join room ", val);
            socket.join(val);
=======
        const sessionUser = socket.request.session;
        // UUID 랑 session id랑 변환이 힘듬;; 그냥 이메일로 검색
        // TODO: 나중에 고치기
        const chatUser = await chatUserController.getUserByEmail(
            sessionUser.user.email,
        );

        if (chatUser === null) {
            throw new Error("User not exists");
        }
        console.log("socket.id", socket.id);
        socket.on("userTryJoin", async (req: joinRequestProps) => {
            // Is he ok to join?
            const { chatRoomId, deviceLastSeq } = req;
            const chatRoom =
                await chatRoomController.getChatRoomById(chatRoomId);
            console.log("messages", req);

            socket.data.chatRoom = chatRoom;
            console.log("Socket chatroom", socket.data.chatRoom);
            if (chatRoom === null) {
                throw new Error(`Room not exist: ${chatRoomId}`);
            }
            if (!chatRoom.participant_ids.includes(chatUser.user_id)) {
                throw new Error("User have no perssion to access a room");
            }

            // received unread messages and update unread schema
            const currChatRoomSeq = chatRoom.message_seq;
            const messages = [];
            if (currChatRoomSeq - deviceLastSeq > 0) {
                // get unread messages
                const unreadMessages =
                    await chatContentController.getChatRoomMessagesBySeq(
                        chatRoom,
                        deviceLastSeq,
                    );
                messages.join(unreadMessages);
                // update unread schema
                await chatUnreadController.updateUserUnread(
                    chatUser,
                    chatRoom,
                    currChatRoomSeq,
                );
            }
            // get last read sequences
            const lastReadSeqences =
                await chatUnreadController.getUnreadSequences(chatRoom);

            const res = JSON.stringify({
                messages: messages,
                lastReadSequences: lastReadSeqences,
            });

            try {
                const response = await socket
                    .timeout(5000)
                    .emitWithAck("userJoined", res);
                // join user after acknowledgement
                console.log("User joined: ", chatRoomId, " status: ", response);
                socket.join(chatRoomId);
                console.log(socket.id, socket.data);
            } catch (e) {
                // should now reach here
                throw new Error("User couldn't join the room");
            }
>>>>>>> Stashed changes
        });

        socket.on("sendMessage", async (recv, callback) => {
            console.log(recv);
            const { chatRoomId, message } = JSON.parse(recv);
<<<<<<< Updated upstream
=======
            const chatRoom = socket.data.chatRoom;
            console.log("message: ", recv);
            console.log(
                "chatRoom: ",
                chatRoom,
                chatRoomId,
                socket.id,
                socket.data,
            );
            /*
>>>>>>> Stashed changes
            const messagePool =
                await chatContentController.getChatRoomMessages(chatRoomId);
            console.log("messagePool", messagePool);
            if (messagePool !== undefined) {
                // message DB 업데이터
                const user = await models.User.findOne({
                    where: { email: message.senderName },
                    attributes: ["user_id", "username", "email"],
                });
                await chatContentController.sendMessage(
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
<<<<<<< Updated upstream
            socket
=======
            */
            try {
                const responses = await io
                    .to(chatRoomId)
                    .timeout(1000)
                    .emitWithAck("respondMessage", JSON.stringify(message));
                console.log("chatroom broadcast response", responses);
            } catch (e) {
                console.log("chatroom broadcast error", e);
            }
            /* socket
>>>>>>> Stashed changes
                .in(chatRoomId)
                .emit("respondMessage", JSON.stringify(message));
            */
            callback(JSON.stringify(message));
        });

        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });

    return io;
}
