import { chatUser, chatRoom, unread } from "../../models/chat";
import type { UserAttributes } from "../../models/User";
import type { RequestAttributes } from "../../models/Request";

export const createChatRoom = async (
    request_id: string,
    consumer: UserAttributes,
    participants: UserAttributes[],
) => {
    const uuidList = participants.map((user) => user.user_id);

    const participants_ids = await chatUser.find({ uuid: { $in: uuidList } });
    const consumer_id = await chatUser.findOne({ uuid: consumer.user_id });

    await chatRoom.create({
        request_id: request_id,
        consumer: consumer_id,
        participants: participants_ids,
    });
};

export const getChatRoomsByRequest = async (request: RequestAttributes) => {
    return await chatRoom.find({ request_id: request.request_id });
};

export const getAllChatRoomsByUser = async (user: UserAttributes) => {
    const chatuser = await chatUser.findOne({ uuid: user.user_id });

    return await chatRoom.find({ participants: chatuser });
};

export const getAliveChatRoomsByUser = async (user: UserAttributes) => {
    const chatuser = await chatUser.findOne({ uuid: user.user_id });

    return await chatRoom.find({
        participants: chatuser,
        // request_id of chat rooms whose requests are not done yet should be bigger than 0
        request_id: { $gte: 0 },
    });
};

export const delChatRoomsByRequest = async (request: RequestAttributes) => {
    // delete unread
    const chatRooms = await chatRoom.find({ request_id: request.request_id });
    const chatRoomIds = chatRooms.map((chatRoom) => chatRoom._id);
    await unread.deleteMany({ chatroom_id: { $in: chatRoomIds } });

    // change request_id: 23 -> -23
    return await chatRoom.updateMany(
        { request_id: request.request_id },
        { $set: { request_id: -1 * request.request_id } },
    );
};
