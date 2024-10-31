import mongoose from "mongoose";

const unreadSchema = new mongoose.Schema(
    {
        chatroom_id: { type: mongoose.Types.ObjectId, required: true },
        message_id: { type: mongoose.Types.ObjectId, required: true },
        users: { type: [mongoose.Types.ObjectId], required: true },
    },
    {
        collection: "unread",
    },
);

const unread = mongoose.model("unread", unreadSchema);

export default unread;
