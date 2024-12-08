import mongoose from "mongoose";
import ChatUser from "./ChatUser";
import ChatContent from "./ChatContet";
import ChatRoom from "./chatRoom";
import Unread from "./unread";
import logger from "../../utils/logger";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

mongoose
    .connect(process.env.MONGODB_URI, {
        dbName: process.env.MONGODB_DATABASE,
    })
    .then(async (val) => {
        logger.info("Connected to MongoDB => UserAPI");
        logger.info("drop collections");
        await val.connection.dropCollection("chat_users");
        await val.connection.dropCollection("chat_rooms");
        await val.connection.dropCollection("chat_contents");
        await val.connection.dropCollection("unreads");
    })
    .catch((err) => {
        logger.error(err);
    });

export { ChatUser, ChatContent, ChatRoom, Unread };
