import mongoose from "mongoose";
import { chatContent, chatUser } from "../../models/chat";
import type { UserAttributes } from "../../models/User";
import { pushMessageQueue } from "./messageQueue";
import { gt } from "drizzle-orm";

export const sendMessage = async (
    chatRoom_id: mongoose.Types.ObjectId,
    sender: UserAttributes,
    message: string,
) => {
    const chatSender = await chatUser.findOne({ uuid: sender.user_id });

    if (chatSender === null) {
        throw Error("User not exist in Mongodb");
        return;
    }

    await pushMessageQueue(chatRoom_id, message, chatSender._id);
};

export const getChatRoomMessages = async (
    chatRoom_id: mongoose.Types.ObjectId,
) => {
    const messages = await chatContent.find({ chatroom_id: chatRoom_id });

    return messages;
};

export const getChatRoomMessagesOfUser = async (
    chatRoom_id: mongoose.Types.ObjectId,
    mongoUser: mongoose.Types.ObjectId,
) => {
    const messages = await chatContent
        .find({ chatroom_id: chatRoom_id })
        .updateMany({}, { $pull: { unread_users: mongoUser } });

    return messages;
};

export const getChatRoomMessagesBySeq = async (
    chatRoom_id: mongoose.Types.ObjectId,
    last_seq: number,
) => {
    const messages = await chatContent
        .find({ chatroom_id: chatRoom_id })
        .gt("seq", last_seq);

    return messages;
};

export const getChatRoomMessagesBySeqOfUser = async (
    chatRoom_id: mongoose.Types.ObjectId,
    last_seq: number,
    mongoUser: mongoose.Types.ObjectId,
) => {
    const messages = await chatContent
        .find({ chatroom_id: chatRoom_id })
        .gt("seq", last_seq)
        .updateMany({}, { $pull: { unread_users: mongoUser } });

    return messages;
};

export const getChatRoomMessagesBiz = async (
    chatRoom_id: mongoose.Types.ObjectId,
    user: UserAttributes,
) => {
    const mongoUser = await chatUser.findOne({ uuid: user.user_id });
    if (mongoUser === null) {
        throw Error("User not exist in Mongodb");
    }
    const messages = await chatContent.find({ chatroom_id: chatRoom_id });
    if (messages === null) return [];

    const filteredMessages = messages.map((val) => {
        console.log(val.sender_id === mongoUser._id);
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
