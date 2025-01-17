import mongoose, { Types, HydratedDocument } from "mongoose";
import { Unread, ChatUser, ChatRoom, Types as ChatTypes } from "../../models/chat";
import { pushSendAlarm, pushUpdateChatRoom } from "./messageQueue";
import { APIType } from "@mesh/api_spec";
import logger from "../../utils/logger";

type UserSentEventReturn = APIType.WebSocketType.UserSentEventReturn;

export const updateUserUnreadByUUID = async (uuid: Buffer, chatRoomId: Types.ObjectId, seq: number) => {
    await Unread.findOneAndUpdate({ chatroom: chatRoomId, user_id: uuid }, { last_read_seq: seq });
};

export const updateUserUnread = async (chatUserId: Types.ObjectId, chatRoomId: Types.ObjectId, seq: number) => {
    const chatUser = await ChatUser.findById(chatUserId);
    if (chatUser === null) {
        return;
    }

    await Unread.findOneAndUpdate({ chatroom: chatRoomId, user_id: chatUser.user_id }, { last_read_seq: seq });
};

export const updateUsersUnreads = async (objectIds: Types.ObjectId[]) => {
    const uuids = await ChatUser.find({ _id: { $in: objectIds } }).get("user_id");
};

export const getUnreadSequences = async (chatRoomId: Types.ObjectId) => {
    const unreadSequences = (await Unread.find({ chatroom: chatRoomId })).map((val) => val.last_read_seq);

    return unreadSequences;
};

export const getUnreadCountOfUser = async (uuid: Buffer) => {
    const userUnreads = await Unread.find({ user_id: uuid });
    const chatRoomIds = userUnreads.map((unread) => unread.chatroom);
    const chatRooms = await ChatRoom.find({ $and: [ {_id:{$in: chatRoomIds }}, {request_id: {$gt: 0}} ]  });

    let ret = 0;
    chatRooms.forEach((chatRoom) => {
        const foundUnread = userUnreads.find((unread) => unread.chatroom._id.toString() === chatRoom._id.toString());
        // Chat room newly created and user never participated in a room
        if (foundUnread === undefined || foundUnread.last_read_seq === -1) {
            ret += chatRoom.message_seq;
        } else {
            ret += chatRoom.message_seq - foundUnread.last_read_seq;
        }
    });

    return ret;
};

export const whetherSendAlarm = async (
    chatRoomId: Types.ObjectId,
    message: UserSentEventReturn,
    participantIds: Buffer[],
    chatUsersIds: Types.ObjectId[],
) => {
    participantIds.map(async (uuid) => {
        const chatUser = await ChatUser.findOne({ user_id: uuid });
        logger.debug(`WhethersendAlarm: ${chatUser}:${JSON.stringify(message)}`);

        if (chatUser !== null) {
            const isParticipated = chatUsersIds.find((userId) => userId.toString() === chatUser._id.toString());

            if (isParticipated === undefined) {
                logger.debug(`push update chat room:, ${chatUser}`);
                pushUpdateChatRoom(message, chatRoomId, chatUser._id);
            }
        } else {
            logger.debug("push alarm");
            pushSendAlarm(message, uuid);
        }
    });
};
