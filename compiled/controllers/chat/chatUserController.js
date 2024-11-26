import * as ChatModels from "../../models/chat";
const { ChatUser } = ChatModels;
export const createUser = async (user) => {
    console.log("Create", user);
    return await ChatUser.create({
        user_id: user.user_id,
        email: user.email,
        username: user.username,
        user_name_glb: { en: user.username },
        image_url: user.image,
    });
};
export const delUserById = async (objectId) => {
    return await ChatUser.findByIdAndDelete(objectId);
};
export const getUser = async (user) => {
    return await ChatUser.findOne({ user_id: user.user_id });
};
export const getUserByUUID = async (uuid) => {
    return await ChatUser.findOne({ user_id: uuid });
};
export const getUsers = async (users) => {
    const uuidList = users.map((user) => user.user_id);
    return await ChatUser.find({ user_id: { $in: uuidList } });
};
export const getUsersByUUID = async (uuids) => {
    const ret = await ChatUser.find({ user_id: { $in: uuids } });
    return ret;
};
export const getUsersById = async (objectIds) => {
    const ret = await ChatUser.find({ _id: { $in: objectIds } });
    return ret;
};
export const getUserByEmail = async (email) => {
    return await ChatUser.findOne({ email: email });
};
