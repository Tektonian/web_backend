import mongoose from "mongoose";
import { chatContent, chatUser, unread } from "../../models/chat";

export const updateUserUnread = async (
    chatUser: mongoose.Types.ObjectId,
    chatroom: mongoose.Types.ObjectId,
    seq: number,
) => {
    await unread.findOneAndUpdate(
        { chatroom: chatroom, user_id: chatUser.user_id },
        { last_read_message_seq: seq },
    );
};

export const getUnreadSequences = async (chatRoom: mongoose.Types.ObjectId) => {
    const unreadSequences = (await unread.find({ chatroom: chatRoom })).map(
        (val) => val.last_read_message_seq,
    );

    return unreadSequences;
};
