import mongoose from "mongoose";
import {
    chatUser,
    chatRoom,
    chatContent,
    transaction,
} from "../../models/chat";
import type { UserAttributes } from "../../models/UserAttributes";
import { pushMessageQueue } from "./messageQueue";

export const createUser = async (user: UserAttributes) => {
    return await chatUser.create({
        uuid: user.user_id,
        email: user.email,
        user_name_glb: { kr: user.username },
        image_url: user.image,
    });
};

export const getUser = async (user: UserAttributes) => {
    return await chatUser.findOne({ uuid: user.user_id });
};

export const getUsers = async (users: UserAttributes[]) => {
    const uuidList = users.map((user) => user.user_id);

    return await chatUser.find({ uuid: { $in: uuidList } });
};

export const createChatRoom = async (
    request_id: string,
    consumer: UserAttributes,
    participants: UserAttributes[],
) => {
    const participants_ids = await getUsers(participants);
    const consumer_id = await getUser(consumer);

    await chatRoom.create({
        request_id: request_id,
        consumer: consumer_id,
        participants: participants_ids,
    });
};

export const getChatRoomsByRequest = async (request_id: string) => {
    return await chatRoom.find({ request_id: request_id });
};

export const getChatRoomsByUser = async (user: UserAttributes) => {
    const u = await getUser(user);
    return await chatRoom.find({ participants: { $in: u } });
};

export const delChatRoomsByRequest = async (request_id: string) => {
    return await chatRoom.deleteOne({ request_id: request_id });
};

export const sendMessage = async (
    chatRoom_id: string,
    sender: UserAttributes,
    message: string,
) => {
    const sendUser = await getUser(sender);
    await pushMessageQueue(chatRoom_id, message, sendUser._id);
};

export const getChatRoomMessages = async (
    chatRoom_id: mongoose.Types.ObjectId,
) => {
    const messages = await chatContent.find({ chatroom_id: chatRoom_id });

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

export const getChatRoomMessagesBiz = async (
    chatRoom_id: mongoose.Types.ObjectId,
    user: UserAttributes,
) => {
    const mongoUser = await getUser(user);
    console.log("mongo", user);
    const messages = await chatContent.find({ chatroom_id: chatRoom_id });
    if (mongoUser === null) return [];

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
