import mongoose, { Schema, Types } from "mongoose";
const unreadSchema = new Schema({
    chatroom: { type: Schema.Types.ObjectId, required: true },
    user_id: { type: Types.UUID, required: true },
    send_alarm: { type: Schema.Types.Boolean, default: true },
    // last_read_message_seq is for calculating unread messages
    last_read_at: { type: Date },
    last_read_seq: { type: Number, required: true, default: 0 },
}, {
    collection: "unreads",
});
const Unread = mongoose.model("unreads", unreadSchema);
export default Unread;
