import mongoose, { Types } from "mongoose";
import { models } from "../../models/rdbms";
import { ChatUser } from "../../models/chat";
/**
 * Type
 */
import type { UserAttributes } from "../../models/rdbms/User";

const User = models.User;

export const createChatUser = async (user_id: Buffer) => {
    const user = await User.findByPk(user_id, { raw: true });
    if (user === null) {
        return undefined;
    }
    return await ChatUser.create({
        user_id: user.user_id,
        email: user.email,
        user_name: user.username ?? "",
        user_name_glb: { en: user.username ?? "" },
        image_url: user.image,
    });
};

export const delChatUserById = async (objectId: Types.ObjectId) => {
    return await ChatUser.findByIdAndDelete(objectId);
};

export const getChatUserByUUID = async (uuid: Buffer) => {
    return await ChatUser.findOne({ user_id: uuid });
};

export const getChatUsersByUUID = async (uuids: Buffer[]) => {
    const ret = await ChatUser.find({ user_id: { $in: uuids } });

    return ret;
};

export const getChatUsersById = async (objectIds: mongoose.Types.ObjectId[]) => {
    const ret = await ChatUser.find({ _id: { $in: objectIds } });

    return ret;
};
