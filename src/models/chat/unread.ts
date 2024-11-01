import mongoose from "mongoose";

// Unread schema is for displaying status of chatroom and push alarm.
// Ex) When user entered chatroom pages users will see last sent message and count of unread message
// unread schema uses user_id && chatroom_id as indexes. Which means this schema is per (user and chatroom) not per message;
const unreadSchema = new mongoose.Schema(
    {
        chatroom_id: { type: mongoose.Types.ObjectId, required: true },
        user_id: { type: mongoose.Types.ObjectId, required: true },
        count: { type: Number, default: 0 },
        last_message: { type: mongoose.Types.ObjectId, required: true },
        last_message_content: { type: String, required: true },
        last_message_created_at: { type: Date, required: true },
        last_message_sender: { type: String, required: true },
    },
    {
        collection: "unread",
    },
);

const unread = mongoose.model("unread", unreadSchema);

export default unread;
