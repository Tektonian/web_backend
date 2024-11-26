import mongoose, { ObjectId, HydratedDocument } from "mongoose";
import * as ChatModels from "../../models/chat";
import { IChatContent, IChatroom } from "../../types/chat/chatSchema.types";
import { pushSendAlarm, pushUpdateChatRoom } from "./messageQueue";
import type { UserAttributes } from "../../models/rdbms/User";
const { Unread, ChatUser, ChatRoom } = ChatModels;

export const updateUserUnread = async (
    chatUser: mongoose.Types.ObjectId,
    chatroom: mongoose.Types.ObjectId,
    seq: number,
) => {
    const tempUser = await ChatUser.findOne({ _id: chatUser });
    await Unread.findOneAndUpdate(
        { chatroom: chatroom, user_id: tempUser.user_id },
        { last_read_seq: seq },
    );
};

export const getUnreadSequences = async (chatRoom: mongoose.Types.ObjectId) => {
    const unreadSequences = (await Unread.find({ chatroom: chatRoom })).map(
        (val) => val.last_read_seq,
    );

    return unreadSequences;
};

export const getTotalUnreadCount = async (user_id: mongoose.Types.UUID) => {
    const userUnreads = await Unread.find({ user_id: user_id });

    const promises = userUnreads.map(async (unread) => {
        const chatRoom = await ChatRoom.findById(unread.chatroom._id);
        const message_seq = chatRoom?.message_seq ?? 0;
        return message_seq - unread.last_read_seq;
    });

    const counts = await Promise.all(promises);

    const totalUnreadCount = counts.reduce((sum, cnt) => sum + cnt, 0);

    return totalUnreadCount;
};

export const whetherSendAlarm = async (
    chatRoom: HydratedDocument<IChatroom>,
    message: HydratedDocument<IChatContent>,
    participant_ids: mongoose.Types.UUID[],
    chatUsersIds: ObjectId[],
) => {
    participant_ids.map(async (uuid) => {
        const chatUser = await ChatUser.findOne({ user_id: uuid });
        const unreadTotalCount = await getTotalUnreadCount(uuid);
        console.log("WhethersendAlarm", chatUser, " ", message);
        console.log("WhethersendAlarm2", chatUsersIds, " ", unreadTotalCount);

        if (chatUser !== null) {
            const isParticipated = chatUsersIds.find(
                (userId) => userId === chatUser._id.toString(),
            );

            console.log("push update chat room:", chatUser);
            if (isParticipated === undefined) {
                pushUpdateChatRoom(chatRoom, message, chatUser);
                pushSendAlarm(chatRoom, message, unreadTotalCount, uuid);
            }
        } else {
            pushSendAlarm(chatRoom, message, unreadTotalCount, uuid);
        }
    });
};
