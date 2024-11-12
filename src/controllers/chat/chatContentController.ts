import mongoose from "mongoose";
import * as ChatModels from "../../models/chat";
import type { UserAttributes } from "../../models/User";
import { pushMessageQueue } from "./messageQueue";

const { ChatUser, ChatContent } = ChatModels;

export const sendMessage = async (
    chatRoomId: mongoose.Types.ObjectId,
    sender: mongoose.Types.ObjectId,
    message: string,
) => {
    console.log("Send message", chatRoomId, sender, message);

    if (sender === null) {
        throw Error("User not exist in Mongodb");
        return;
    }

    await pushMessageQueue(chatRoomId, message, sender);
};

export const getChatRoomMessages = async (
    chatRoomId: mongoose.Types.ObjectId,
) => {
    const messages = await ChatContent.find({ chatroom: chatRoomId });

    return messages;
};

export const getChatRoomMessagesOfUser = async (
    chatRoomId: mongoose.Types.ObjectId,
    mongoUser: mongoose.Types.ObjectId,
) => {
    const messages = await ChatContent.find({ chatroom_id: chatRoomId });

    return messages;
};

export const getChatRoomMessagesBySeq = async (
    chatroom: mongoose.Types.ObjectId,
    last_seq: number,
) => {
    const messages = await ChatContent.find({ chatroom: chatroom }).gt(
        "seq",
        last_seq,
    );

    return messages;
};

export const getChatRoomLastMessage = async (
    chatroom: mongoose.Types.ObjectId,
) => {
    const message = await ChatContent.findOne({
        $and: [{ chatroom: chatroom }, { seq: chatroom.message_seq - 1 }],
    });

    return message;
};

export const getChatRoomMessagesBiz = async (
    chatRoomId: mongoose.Types.ObjectId,
    user: UserAttributes,
) => {
    const mongoUser = await ChatUser.findOne({ user_id: user.user_id });
    if (mongoUser === null) {
        throw Error("User not exist in Mongodb");
    }
    const messages = await ChatContent.find({ chatroom: chatRoomId });
    if (messages === null) return [];

    const filteredMessages = messages.map((val) => {
        return {
            message: val.message,
            direction: mongoUser._id.equals(val.sender_id)
                ? "outgoing"
                : "incoming",
            createdAt: val.created_at,
        };
    });

    return filteredMessages;
};
