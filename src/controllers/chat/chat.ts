import mongoose from "mongoose";
import {
    chatUser,
    chatRoom,
    chatContent,
    transaction,
} from "../../models/chat";
import type { UserAttributes } from "../../models/UserAttributes";

export const createUser = async (user: UserAttributes) => {
    return await chatUser.create({
        uuid: user.user_id,
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

export const getChatRoomByRequest = async (request_id: string) => {
    return await chatRoom.findOne({ request_id: request_id });
};

export const getChatRoomsByUser = async (user: UserAttributes) => {
    const u = await getUser(user);
    return await chatRoom.find({ participants: { $in: u } });
};

export const delChatRoomByRequest = async (request_id: string) => {
    return await chatRoom.deleteOne({ request_id: request_id });
};

export const sendMessage = async (
    request_id: string,
    sender: UserAttributes,
    message: string,
) => {
    const found = await chatRoom.findOneAndUpdate(
        { request_id: request_id },
        { $inc: { message_seq: 1 } },
    );

    const sendUser = await getUser(sender);
    return chatContent.create({
        chatroom_id: found._id,
        message: message,
        sender_id: sendUser._id,
        seq: found?.message_seq,
    });
};

export const getMessagesByRequest = async (request_id: string) => {
    const chatRoom = await getChatRoomByRequest(request_id);
    const messages = await chatContent.find({ chatroom_id: chatRoom._id });

    return messages;
};
