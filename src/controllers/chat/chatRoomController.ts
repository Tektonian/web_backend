import { Types } from "mongoose";
import * as ChatModels from "../../models/chat";
import type { UserAttributes } from "../../models/rdbms/User";
import { models as RDBModels } from "../../models/rdbms";
import logger from "../../utils/logger";

const { ChatRoom, ChatUser, Unread, ChatContent } = ChatModels;
const { Request, User } = RDBModels;

export const createChatRoom = async (
    requestId: number,
    consumerId: Buffer,
    participantIds: Buffer[],
) => {
    try {
        const request = await Request.findOne({
            where: { request_id: requestId },
            raw: true,
        });

        const consumer = await User.findOne({
            where: { user_id: consumerId },
            raw: true,
        });

        const participants = await User.findAll({
            where: { user_id: participantIds },
            raw: true,
        });

        if (!request || !consumer || !participants) {
            logger.error("No data");
            return;
        }

        const chatRoomInstance = await ChatRoom.create({
            request_id: request.request_id,
            title: request.title,
            consumer_id: consumerId,
            participant_ids: participantIds,
        });
        console.log("chatroominstance", chatRoomInstance);
        const res = await Promise.all(
            participants.map(async (parti) => {
                await Unread.create({
                    chatroom: chatRoomInstance,
                    user_id: parti.user_id,
                });
            }),
        );

        const chatContent = await ChatContent.create({
            chatroom: chatRoomInstance,
            seq: 0,
            content_type: "alarm",
            content: "방이 생성되었어요",
            sender_id: Buffer.from([0]),
            image_url: "",
        });
        return chatRoomInstance;
    } catch (e) {
        logger.warn(`Failed chatroom created ${e}`);
        throw new Error("Create room failed");
    } finally {
        logger.info("ChatRoom created");
    }
};

export const getChatRoomById = async (chatRoomId: Types.ObjectId) => {
    return await ChatRoom.findById(chatRoomId);
};

export const getChatRoomsByRequestId = async (requestId: number) => {
    return await ChatRoom.find({ request_id: requestId });
};

export const getAllChatRoomsByUser = async (user: UserAttributes) => {
    return await ChatRoom.find({ participant_ids: user.user_id });
};

export const getAliveChatRoomsByUser = async (userId: Types.ObjectId) => {
    const chatUser = await ChatUser.findOne({ user_id: userId });

    if (chatUser === null) {
        return undefined;
    }

    return await ChatRoom.find({
        participant_ids: chatUser.user_id,
        // request_id of chat rooms whose requests are not done yet should be bigger than 0
        request_id: { $gte: 0 },
    });
};

export const delChatRoomsByRequest = async (requestId: number) => {
    // delete unread
    const request = await Request.findOne({
        where: { request_id: requestId },
        raw: true,
    });
    if (request === null) {
        logger.error("No such request");
        return undefined;
    }
    const chatRooms = await ChatRoom.find({ request_id: request.request_id });
    const chatRoomIds = chatRooms.map((chatRoom) => chatRoom._id);
    await Unread.deleteMany({ chatroom_id: { $in: chatRoomIds } });

    // change request_id: 23 -> -23
    return await ChatRoom.updateMany(
        { request_id: request.request_id },
        { $set: { request_id: -1 * request.request_id } },
    );
};

export const delChatRoom = async (chatRoomId: Types.ObjectId) => {
    const chatRoom = await ChatRoom.findOne({ _id: chatRoomId });
    if (chatRoom === null) {
        throw new Error("No such chatroom");
    }

    await Unread.deleteMany({ chatroom_id: chatRoom._id });

    return await ChatRoom.updateOne(
        { _id: chatRoom._id },
        { $set: { request_id: -1 * chatRoom.request_id } },
    );
};

export const actionCompleteRecruit = async (
    requestId: number,
    consumerId: Buffer,
    providerIds: Buffer[],
) => {
    // Find chatRooms that need to be deleted
    const toDelChatRooms = await ChatRoom.find({
        $and: [
            { request_id: requestId },
            { participant_ids: { $nin: providerIds } },
        ],
    });
    await Promise.all(
        toDelChatRooms.map(async (room) => {
            return await delChatRoom(room._id);
        }),
    );

    // Won't create unnecessary group room
    if (providerIds.length !== 1) {
        await createChatRoom(requestId, consumerId, [
            ...providerIds,
            consumerId,
        ]);
    }

    // TODO: Push Update chatroom request
};

// Needed?
export const leaveChatRoom = async (
    chatRoomId: Types.ObjectId,
    userId: Buffer,
) => {
    const chatRoom = await ChatRoom.findById(chatRoomId);

    if (chatRoom === null) {
        throw new Error("No such room");
    }

    const newIds = chatRoom.participant_ids.filter((id) => !id.equals(userId));

    return await ChatRoom.updateOne(
        { _id: chatRoom._id },
        { participant_ids: newIds },
    );
};
