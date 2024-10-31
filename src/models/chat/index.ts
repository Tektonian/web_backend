import mongoose from "mongoose";
import chatUser from "./user";
import chatRoom from "./chatRoom";
import chatContent from "./chatContent";
import unread from "./unread";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

mongoose
    .connect(process.env.MONGODB_URI, {
        dbName: process.env.MONGODB_DATABASE,
    })
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
