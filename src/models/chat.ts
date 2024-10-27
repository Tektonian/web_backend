import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        user_name_glb: { type: Map, required: true },
        image_url: { type: String, default: "" },
    },
    {
        collection: "users",
        timestamps: true,
    },
);

const chatRoomsSchema = new mongoose.Schema(
    {
        request_id: { type: String, required: true },
        consumer: { type: mongoose.Types.ObjectId, required: true },
        participants: { type: Array, required: true },
        participants_ids: { type: Map, required: true },
    },
    {
        collection: "chat_rooms",
        timestamps: true,
    },
);

const chatContentsSchema = new mongoose.Schema(
    {
        chatroom_id: { type: mongoose.Types.ObjectId, required: true },
        seq: { type: Number, required: true, default: 0 },
        messate_type: { type: String, default: "text" },
        message: { type: String, default: "" },
        sender_id: { type: mongoose.Types.ObjectId, default: "-1" },
        url: { type: String, default: "" },
    },
    {
        timestamps: true,
        collection: "chat_contents",
    },
);

export { userSchema, chatContentsSchema, chatRoomsSchema };
