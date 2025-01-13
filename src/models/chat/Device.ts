import mongoose, { Schema, Types } from "mongoose";

const deviceScheme = new Schema(
    {
        // Since the ObjectId(=_id) of MongoDB is not reliable
        // We will record user's id in userSchema
        user_id: {
            type: Schema.Types.Buffer,
            required: true,
            get: (uuid) => Buffer.from(uuid),
        },
        device_id: {
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
        collection: "device",
    },
);

const Device = mongoose.model("device", deviceScheme);

export default Device;
