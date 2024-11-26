import * as ChatModels from "../../models/chat";
const { ChatRoom, ChatUser, Unread } = ChatModels;
export const createChatRoom = async (request_id, consumer, participants) => {
    // TODO: should be transactional
    const uuidList = participants.map((user) => user.user_id);
    const chatParticipants = await ChatUser.find({
        user_id: { $in: uuidList },
    });
    const chatConsumer = await ChatUser.findOne({ user_id: consumer.user_id });
    console.log("Partipa", participants);
    const chatRoomInstance = await ChatRoom.create({
        request_id: request_id,
        consumer_id: chatConsumer.user_id,
        participant_ids: chatParticipants.map((u) => u.user_id),
    });
    const res = await Promise.all(chatParticipants.map(async (parti) => {
        await Unread.create({
            chatroom: chatRoomInstance,
            user_id: parti.user_id,
        });
    }));
    return chatRoomInstance;
};
export const getChatRoomById = async (objectId) => {
    return await ChatRoom.findById(objectId);
};
export const getChatRoomsByRequest = async (request) => {
    return await ChatRoom.find({ request_id: request.request_id });
};
export const getAllChatRoomsByUser = async (user) => {
    return await ChatRoom.find({ participant_ids: user.user_id });
};
export const getAliveChatRoomsByUser = async (user) => {
    const chatuser = await ChatUser.findOne({ user_id: user.user_id });
    return await ChatRoom.find({
        participant_ids: chatuser.user_id,
        // request_id of chat rooms whose requests are not done yet should be bigger than 0
        request_id: { $gte: 0 },
    });
};
export const delChatRoomsByRequest = async (request) => {
    // delete unread
    const chatRooms = await ChatRoom.find({ request_id: request.request_id });
    const chatRoomIds = chatRooms.map((chatRoom) => chatRoom._id);
    await Unread.deleteMany({ chatroom_id: { $in: chatRoomIds } });
    // change request_id: 23 -> -23
    return await ChatRoom.updateMany({ request_id: request.request_id }, { $set: { request_id: -1 * request.request_id } });
};
