import mongoose from "mongoose";
import { userSchema, chatContentsSchema, chatRoomsSchema, } from "../models/chat";
mongoose
    .connect("mongodb://localhost:27017/", { dbName: "chat" })
    .then(() => {
    console.log("Connected to MongoDB => UserAPI");
})
    .catch((err) => {
    console.log(err);
});
const userModel = mongoose.model("users", userSchema);
const chatContentsModel = mongoose.model("chat_contents", chatContentsSchema);
const chatRoomsModel = mongoose.model("chat_rooms", chatRoomsSchema);
export const chatTest = async () => {
    console.log("Chat test");
    const test0 = await userModel.findById("671cab8775ffa230538d44e1");
    const test1 = await userModel.findById("671cab9375ffa230538d44e3");
    console.log(test0, test1);
    // @ts-ignore
    const participants_ids = { [test0._id]: 0, [test1._id]: 1 };
    console.log(participants_ids);
    return;
    const chatContent = await chatContentsModel.create({
        chatroom_id: "671cd93c73db7829a9eec887",
        sender_id: "671cab9375ffa230538d44e1",
        message: "Hellow",
    });
    return;
    const chatRoom = await chatRoomsModel.findById("671cd93c73db7829a9eec887");
    console.log("chatroom", chatRoom);
    chatContentsModel.create({
        chatroom_id: chatRoom?._id,
    });
    return;
    await chatRoomsModel.create({
        request_id: "5123",
        consumer: test0?._id,
        participants: [test0?._id, test1?._id],
        participants_ids: participants_ids,
    });
};
