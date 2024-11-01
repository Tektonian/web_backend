import mongoose from "mongoose";
import { chatContent, chatUser } from "../../models/chat";
import type { UserAttributes } from "../../models/User";
import { pushMessageQueue } from "./messageQueue";

export const sendMessage = async (
    chatRoomId: mongoose.Types.ObjectId,
    sender: UserAttributes,
    message: string,
) => {
    const chatSender = await chatUser.findOne({ user_id: sender.user_id });

    if (chatSender === null) {
        throw Error("User not exist in Mongodb");
        return;
    }

    await pushMessageQueue(chatRoomId, message, chatSender.user_id);
};

export const getChatRoomMessages = async (
    chatRoomId: mongoose.Types.ObjectId,
) => {
    const messages = await chatContent.find({ chatroom: chatRoomId });

    return messages;
};

export const getChatRoomMessagesOfUser = async (
    chatRoomId: mongoose.Types.ObjectId,
    mongoUser: mongoose.Types.ObjectId,
) => {
    const messages = await chatContent.find({ chatroom_id: chatRoomId });

    return messages;
};

export const getChatRoomMessagesBySeq = async (
    chatRoomId: mongoose.Types.ObjectId,
    last_seq: number,
) => {
    const messages = await chatContent
        .find({ chatroom_id: chatRoomId })
        .gt("seq", last_seq);

    return messages;
};

export const getChatRoomMessagesBiz = async (
    chatRoomId: mongoose.Types.ObjectId,
    user: UserAttributes,
) => {
    const mongoUser = await chatUser.findOne({ user_id: user.user_id });
    if (mongoUser === null) {
        throw Error("User not exist in Mongodb");
    }
    const messages = await chatContent.find({ chatroom: chatRoomId });
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
