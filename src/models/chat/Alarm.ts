import mongoose, { Schema, Types } from "mongoose";

const alarmSchema = new Schema(
    {
        // Since the ObjectId(=_id) of MongoDB is not reliable
        // We will record user's id in userSchema
        user_id: {
            type: Schema.Types.Buffer,
            required: true,
            get: (uuid) => Buffer.from(uuid),
        },
        seq: { type: Number, required: true, default: 0 },
        content: {
            type: String,
            default: "",
            trim: true,
            // Validator and Error message
            minLength: [1, "Too short message"],
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
        collection: "alarm",
    },
);

const Alarm = mongoose.model("alarm", alarmSchema);

export default Alarm;
