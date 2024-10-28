import mongoose from "mongoose";

const chatRoomsSchema = new mongoose.Schema(
    {
        request_id: { type: String, required: true, unique: true },
        consumer: { type: mongoose.Types.ObjectId, required: true },
        participants: { type: Array, required: true },
        message_seq: { type: Number, default: 0 },
    },
    {
        collection: "chat_rooms",
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },    },
);

const chatRoom = mongoose.model("chat_rooms", chatRoomsSchema);

export default chatRoom;
