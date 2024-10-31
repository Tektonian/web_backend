import mongoose from "mongoose";
import chatUser from "./user";
import chatRoom from "./chatRoom";
import chatContent from "./chatContent";
import unread from "./unread";

mongoose
    .connect("mongodb://localhost:27017/", { dbName: "chat" })
    .then(async (val) => {
        console.log("Connected to MongoDB => UserAPI");
        console.log("drop collections");
        await val.connection.dropCollection("users");
        await val.connection.dropCollection("chat_rooms");
        await val.connection.dropCollection("chat_contents");
        await val.connection.dropCollection("unread");
    })
    .catch((err) => {
        console.log(err);
    });

export { chatUser, chatRoom, chatContent, unread };
