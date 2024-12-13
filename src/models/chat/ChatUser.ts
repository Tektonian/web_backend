import mongoose, { Schema, Types } from "mongoose";

const chatUserSchema = new Schema(
    {
        // Since the ObjectId(=_id) of MongoDB is not reliable
        // We will record user's id in userSchema
        user_id: {
            type: Schema.Types.Buffer,
            required: true,
            get: (uuid) => Buffer.from(uuid),
        },
        user_name: { type: String, required: true },
        nationality: { type: String, required: false },
        multilingual: { type: [String], required: true, default: [] },
        user_name_glb: { type: Map, required: true },
        email: { type: String, default: "", required: true },
        image_url: { type: String, default: "" },
    },
    {
        collection: "chat_users",
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    },
);

const ChatUser = mongoose.model("chat_users", chatUserSchema);

export default ChatUser;
