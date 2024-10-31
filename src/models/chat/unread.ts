import mongoose from "mongoose";

// Unread schema is for displaying status of chatroom and push alarm.
// Ex) When user entered chatroom pages users will see last sent message and count of unread message
// unread schema uses user_id && chatroom_id as indexes. Which means this schema is per (user and chatroom) not per message;
interface UnreadInfoPerChatroom {
    count: Number;
    // lastSentMessage### are for displaying last message and user alarm.
    lastSentMessage?: mongoose.Types.ObjectId;
    lastSentMessageContent: String;
    lastSentMessageTime: Date;
    lastSentMsesageSender: String;
}

const unreadSchema = new mongoose.Schema(
    {
        chatroom: { type: mongoose.Types.ObjectId, required: true },
        user_id: { type: mongoose.Types.UUID, required: true },
        // last_read_message_seq is for calculating unread messages
        last_read_message_seq: { type: Number, required: true, default: 0 },
    },
    {
        collection: "unread",
    },
);

const unread = mongoose.model("unread", unreadSchema);

export default unread;
