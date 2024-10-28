import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        uuid: { type: mongoose.Types.UUID, required: true, unique: true },
        user_name_glb: { type: Map, required: true },
        image_url: { type: String, default: "" },
    },
    {
        collection: "users",
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    },
);

const chatUser = mongoose.model("user", userSchema);

export default chatUser;
