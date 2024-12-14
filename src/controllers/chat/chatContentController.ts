import mongoose, { Types } from "mongoose";
import * as ChatModels from "../../models/chat";
import type { UserAttributes } from "../../models/rdbms/User";

import { pushMessageQueue } from "./messageQueue";

import { APIType } from "api_spec";
import logger from "../../utils/logger";

const { ChatUser, ChatContent, ChatRoom } = ChatModels;

export const sendMessage = async (
    chatRoomId: Types.ObjectId,
    senderId: Types.ObjectId,
    message: APIType.ContentType.MessageContentType,
) => {
    logger.debug(
        `Send message: ChatRoomId: ${chatRoomId}, Sender: ${senderId}, Message: ${message}`,
    );

    await pushMessageQueue(message, chatRoomId, senderId);
};

export const getChatRoomMessages = async (
    chatRoomId: mongoose.Types.ObjectId,
) => {
    const messages = await ChatContent.find({ chatroom: chatRoomId });

    return messages;
};

export const getChatRoomMessagesBySeq = async (
    chatRoomId: mongoose.Types.ObjectId,
    lastSeq: number,
) => {
    const messages = await ChatContent.find({ chatroom: chatRoomId }).gte(
        "seq",
        lastSeq,
    );

    return messages;
};

export const getChatRoomLastMessage = async (chatRoomId: Types.ObjectId) => {
    const chatRoom = await ChatRoom.findById(chatRoomId);

    if (chatRoom === null) {
        logger.error("No such chatroom");
        return undefined;
    }
    const message = await ChatContent.findOne({
        $and: [{ chatroom: chatRoom }, { seq: chatRoom.message_seq }],
    });

    return message;
};
