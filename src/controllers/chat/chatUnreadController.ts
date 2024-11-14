import mongoose, { ObjectId, HydratedDocument } from "mongoose";
import * as ChatModels from "../../models/chat";
import { IChatContent, IChatroom } from "../../types/chat/chatSchema.types";
import { pushSendAlarm, pushUpdateChatRoom } from "./messageQueue";
const { Unread, ChatUser, ChatRoom } = ChatModels;

export const updateUserUnread = async (
    chatUser: mongoose.Types.ObjectId,
    chatroom: mongoose.Types.ObjectId,
    seq: number,
) => {
    await Unread.findOneAndUpdate(
        { chatroom: chatroom, user_id: chatUser.user_id },
        { last_read_seq: seq },
    );
};

export const updateUsersUnreads = async (objectIds: ObjectId[]) => {
    const uuids = await ChatUser.find({ _id: { $in: objectIds } }).get(
        "user_id",
    );
};

export const getUnreadSequences = async (chatRoom: mongoose.Types.ObjectId) => {
    const unreadSequences = (await Unread.find({ chatroom: chatRoom })).map(
        (val) => val.last_read_seq,
    );

    return unreadSequences;
};

export const whetherSendAlarm = async (
    chatRoom: HydratedDocument<IChatroom>,
    message: HydratedDocument<IChatContent>,
    participant_ids: mongoose.Types.UUID[],
    chatUsersIds: ObjectId[],
) => {
    participant_ids.map(async (uuid) => {
        const chatUser = await ChatUser.findOne({ user_id: uuid });
        console.log("WhethersendAlarm", chatUser, " ", message);
        console.log("WhethersendAlarm2", chatUsersIds);

        if (chatUser !== null) {
            const isParticipated = chatUsersIds.find(
                (userId) => userId === chatUser._id.toString(),
            );

            console.log("push update chat room:", chatUser);
            if (isParticipated === undefined) {
                pushUpdateChatRoom(chatRoom, message, chatUser);
            }
        } else {
            console.log("push alarm");
            pushSendAlarm(chatRoom, message, uuid);
        }
    });
};
