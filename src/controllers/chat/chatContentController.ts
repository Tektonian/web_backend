import mongoose, { Types } from "mongoose";
import { ChatUser, ChatContent, ChatRoom, Types as ChatTypes } from "../../models/chat";

import { pushMessageQueue } from "./messageQueue";

import { APIType } from "@mesh/api_spec";
import logger from "../../utils/logger";

export const sendMessage = async (
    message: APIType.ContentType.MessageContentType,
    chatRoomId: Types.ObjectId,
    senderId?: Types.ObjectId,
) => {
    logger.debug(`Send message: ChatRoomId: ${chatRoomId}, Sender: ${senderId}, Message: ${message}`);

    if (message.contentType === "text" && senderId !== undefined) {
        return pushMessageQueue(message, chatRoomId, senderId);
    }
};

export const getChatRoomMessages = async (chatRoomId: mongoose.Types.ObjectId) => {
    const messages = await ChatContent.find({ chatroom: chatRoomId });

    return messages;
};

export const getChatRoomMessagesBySeq = async (chatRoomId: mongoose.Types.ObjectId, lastSeq: number) => {
    const messages = await ChatContent.find({ chatroom: chatRoomId }).gte("seq", lastSeq);

    return messages;
};

export const getChatRoomMessagesByContentType = async (
    chatRoomId: mongoose.Types.ObjectId,
    contentType: ChatTypes.ChatContentType["content_type"],
) => {
    const messages = await ChatContent.find({
        $and: [{ chatroom: chatRoomId }, { content_type: contentType }],
    });

    return messages;
};

export const getChatRoomLastMessage = async (chatRoomId: Types.ObjectId) => {
    const chatRoom = await ChatRoom.findById(chatRoomId);

    if (chatRoom === null) {
        logger.error("No such chatroom");
        return undefined;
    }
    const message = await ChatContent.findOne({
        $and: [{ chatroom: chatRoom }, { seq: chatRoom.message_seq - 1 }],
    });

    return message;
};
