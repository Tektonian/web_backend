import mongoose, { Types } from "mongoose";
import { User } from "../../models/rdbms/User";
import { ChatUser } from "../../models/chat";
import type { UserAttributes } from "../../models/rdbms/User";

export const createChatUser = async (user_id: Buffer) => {
    const user = await User.findByPk(user_id, { raw: true });
    if (user === null) {
        throw new Error("No such user");
        return;
    }
    return await ChatUser.create({
        user_id: user.user_id,
        email: user.email,
        user_name: user.username,
        user_name_glb: { en: user.username },
        image_url: user.image,
    });
};

export const delChatUserById = async (objectId: Types.ObjectId) => {
    return await ChatUser.findByIdAndDelete(objectId);
};

export const getChatUser = async (user: UserAttributes) => {
    return await ChatUser.findOne({ user_id: user.user_id });
};

export const getChatUserByUUID = async (uuid: mongoose.Types.UUID) => {
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
