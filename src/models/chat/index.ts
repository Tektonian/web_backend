import mongoose, { InferSchemaType } from "mongoose";
import ChatUser from "./ChatUser";
import ChatContent from "./ChatContet";
import ChatRoom from "./ChatRoom";
import Unread from "./Unread";
import Device from "./Device";
import Alarm from "./Alarm";
import logger from "../../utils/logger";
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

type ChatUserType = InferSchemaType<(typeof ChatUser)["schema"]>;
type ChatContentType = InferSchemaType<(typeof ChatContent)["schema"]>;
type ChatRoomType = InferSchemaType<(typeof ChatRoom)["schema"]>;
type UnreadType = InferSchemaType<(typeof Unread)["schema"]>;

declare namespace Types {
    export type { ChatUserType, ChatContentType, ChatRoomType, UnreadType };
}

export { ChatUser, ChatContent, ChatRoom, Unread, Device, Alarm };
