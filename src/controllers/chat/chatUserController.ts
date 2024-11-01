import { chatUser } from "../../models/chat";
import type { UserAttributes } from "../../models/User";

export const createUser = async (user: UserAttributes) => {
    return await chatUser.create({
        uuid: user.user_id,
        email: user.email,
        user_name_glb: { kr: user.username },
        image_url: user.image,
    });
};

export const getUser = async (user: UserAttributes) => {
    return await chatUser.findOne({ uuid: user.user_id });
};

export const getUsers = async (users: UserAttributes[]) => {
    const uuidList = users.map((user) => user.user_id);

    return await chatUser.find({ uuid: { $in: uuidList } });
};
