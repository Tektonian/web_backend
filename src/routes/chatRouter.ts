import mongoose from "mongoose";
import { Server } from "socket.io";
import { currentSession } from "../middleware/auth.middleware";
import { chatController } from "../controllers/chat";
import { models } from "../models";

interface joinRequestProps {
    deviceLastSeq: number;
    chatRoomId: string;
}

interface messageResponseProps {
    messages: any[];
    lastReadSequences: number[];
}

export default function initChat(httpServer) {
    const {
        chatContentController,
        chatRoomController,
        chatUserController,
        chatUnreadController,
    } = chatController;
    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:3000",
            credentials: true,
        },
        path: "/api/chat",
    });

    // set user and chatroom datas on socket instance
    io.use((socket, next) => {
        // chatRoom will be set 'join' event
        socket.data.chatRoom = null;
        // TODO: should add protocol to get session -> change later
        socket.request.protocol = "ws";
        currentSession(socket.request, socket.request, next);
    });

    io.on("connection", async (socket) => {
        const sessionUser = socket.request.session;
        // UUID 랑 session id랑 변환이 힘듬;; 그냥 이메일로 검색
        // TODO: 나중에 고치기
        const chatUser = await chatUserController.getUserByEmail(
            sessionUser.user.email,
        );

        if (chatUser === null) {
            return;
            throw new Error("User not exists");
        }

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
            } catch (e) {
                // should now reach here
                throw new Error("User couldn't join the room");
            }
        });

        socket.on("sendMessage", async (recv, callback) => {
            const { chatRoomId, message } = JSON.parse(recv);
            const chatRoom = socket.data.chatRoom;
            console.log("message: ", recv);
            console.log("chatRoom: ", chatRoom);
            /*
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
            */
            const isSent = await chatContentController.sendMessage(
                chatRoomId,
                chatUser,
                message.content,
            );
            socket
                .in(chatRoomId)
                .emit("respondMessage", JSON.stringify(message));
        });

        socket.on("disconnect", () => {
            console.log("User disconnected: ", socket.data.chatRoom);
            socket.data.chatRoom = null;
        });
    });

    return io;
}
