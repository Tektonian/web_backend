import * as ChatModels from "../../models/chat";
import { pushMessageQueue } from "./messageQueue";
const { ChatUser, ChatContent } = ChatModels;
export const sendMessage = async (chatRoomId, sender, message) => {
    console.log("Send message", chatRoomId, sender, message);
    if (sender === null) {
        throw Error("User not exist in Mongodb");
        return;
    }
    await pushMessageQueue(chatRoomId, message, sender);
};
export const getChatRoomMessages = async (chatRoomId) => {
    const messages = await ChatContent.find({ chatroom: chatRoomId });
    return messages;
};
export const getChatRoomMessagesOfUser = async (chatRoomId, mongoUser) => {
    const messages = await ChatContent.find({ chatroom_id: chatRoomId });
    return messages;
};
export const getChatRoomMessagesBySeq = async (chatroom, last_seq) => {
    const messages = await ChatContent.find({ chatroom: chatroom }).gt("seq", last_seq);
    return messages;
};
export const getChatRoomLastMessage = async (chatroom) => {
    const message = await ChatContent.findOne({
        $and: [{ chatroom: chatroom }, { seq: chatroom.message_seq - 1 }],
    });
    return message;
};
export const getChatRoomMessagesBiz = async (chatRoomId, user) => {
    const mongoUser = await ChatUser.findOne({ user_id: user.user_id });
    if (mongoUser === null) {
        throw Error("User not exist in Mongodb");
    }
    const messages = await ChatContent.find({ chatroom: chatRoomId });
    if (messages === null)
        return [];
    const filteredMessages = messages.map((val) => {
        return {
            message: val.message,
            direction: mongoUser._id.equals(val.sender_id)
                ? "outgoing"
                : "incoming",
            createdAt: val.created_at,
        };
    });
    return filteredMessages;
};
