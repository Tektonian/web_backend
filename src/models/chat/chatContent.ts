import mongoose from "mongoose";

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
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
        collection: "chat_contents",
    },
);

const chatContent = mongoose.model("chat_contents", chatContentsSchema);

export default chatContent;
