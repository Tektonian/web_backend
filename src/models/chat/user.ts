import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        // Since the ObjectId(=_id) of MongoDB is not reliable
        // We will record user's id in userSchema
        user_id: { type: mongoose.Types.UUID, required: true, unique: true },
        user_name_glb: { type: Map, required: true },
        email: { type: String, default: "", required: true },
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
