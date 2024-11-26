import mongoose, { Types } from "mongoose";
import * as ChatModels from "../../models/chat";
import type { UserAttributes } from "../../models/rdbms/User";
import { IChatUser } from "../../types/chat/chatSchema.types";
const { ChatUser } = ChatModels;

export const createUser = async (user: UserAttributes) => {
    console.log("Create", user);
    return await ChatUser.create({
        user_id: user.user_id,
        email: user.email,
        username: user.username,
        user_name_glb: { en: user.username },
        image_url: user.image,
    });
};

export const delUserById = async (objectId: Types.ObjectId) => {
    return await ChatUser.findByIdAndDelete(objectId);
};

export const delUsersByUUID = async (uuid: Types.UUID) => {
    await ChatUser.deleteMany({ user_id: uuid });
};

export const getUser = async (user: UserAttributes) => {
    return await ChatUser.findOne({ user_id: user.user_id });
};

export const getUserByUUID = async (uuid: mongoose.Types.UUID) => {
    return await ChatUser.findOne({ user_id: uuid });
};

export const getUsers = async (users: UserAttributes[]) => {
    const uuidList = users.map((user) => user.user_id);

    return await ChatUser.find({ user_id: { $in: uuidList } });
};

export const getUsersByUUID = async (uuids: mongoose.Types.UUID[]) => {
    const ret = await ChatUser.find({ user_id: { $in: uuids } });

    return ret;
};

export const getUsersById = async (objectIds: mongoose.Types.ObjectId[]) => {
    const ret = await ChatUser.find({ _id: { $in: objectIds } });

    return ret;
};

export const getUserByEmail = async (email: string) => {
    return await ChatUser.findOne({ email: email });
};
