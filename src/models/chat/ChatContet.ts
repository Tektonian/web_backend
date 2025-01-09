import mongoose, { Schema, Types } from "mongoose";

const chatContentSchema = new Schema(
    {
        /**
         * Validator
         * @see {@link https://mongoosejs.com/docs/validation.html#built-in-validators}
         */
        chatroom: { type: Schema.Types.ObjectId, required: true },
        seq: { type: Number, required: true, default: 0 },
        content_type: {
            type: String,
            default: "text",
            // Validator
            enum: ["text", "image", "file", "map", "alarm"],
        },
        content: {
            type: String,
            default: "",
            trim: true,
            // Validator and Error message
            minLength: [1, "Too short message"],
        },
        sender_id: {
            type: Schema.Types.Buffer,
            get: (uuid: any) => Buffer.from(uuid),
        },
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

const ChatContent = mongoose.model("chat_contents", chatContentSchema);

export default ChatContent;
