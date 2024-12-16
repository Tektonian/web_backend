import {
    ChatRoom,
    ChatContent,
    ChatUser,
    Types as ChatTypes,
} from "../../models/chat";
import { Queue, Worker, QueueEventsProducer } from "bullmq";
import mongoose, { Types } from "mongoose";

import logger from "../../utils/logger";
import { APIType } from "api_spec";

// Some user sent message at specific chatroom
// Server will record sent messages at database
// Finally server will broadcast saved message to users who paticipate in chatroom
const sentMessageQueue = new Queue("userSentMessage");
const chatEventProducer = new QueueEventsProducer("userSentMessage");

// User will ack to server that "I have received a message and updated last sequence"
// Until then server will wait about 1s until ack message from users
// If not there are two options
// 1st is when user is connected with server through websocket.
// - e.g. when user is in different room
// - In this case we can send user that update chat room unread by using "updateChatRoomQueue"
// 2nd is when user is offline
// - In this case we should send alaram (for mobile device) and sse (for web) by using "sendAlarmQueue"
const updateChatRoomQueue = new Queue("updateChatRoom");
const updateChatRoomProducer = new QueueEventsProducer("updateChatRoom");

const sendAlarmQueue = new Queue("sendAlarm");
const sendAlarmProducer = new QueueEventsProducer("sendAlarm");

const refreshChatRoomsQueue = new Queue("refreshChatRooms");
const refreshChatRoomsProducer = new QueueEventsProducer("refreshChatRooms");

export const pushSendAlarm = async (
    message: APIType.WebSocketType.UserSentEventReturn,
    userUUID: Buffer,
) => {
    logger.debug(`push alaram: ${userUUID.toString("hex")}`);
    sendAlarmProducer.publishEvent({
        eventName: userUUID.toString("hex"),
        jobId: "",
        returnvalue: JSON.stringify(message),
    });
};
export const pushRefreshChatRooms = async (chatUserId: Types.ObjectId) => {
    const chatUser = await ChatUser.findById(chatUserId);

    if (!chatUser) {
        logger.error("No push chat room data");
        return;
    }
    logger.debug(`Update producer ${chatUser._id.toString()}`);
    refreshChatRoomsProducer.publishEvent({
        eventName: chatUser._id.toString(),
        jobId: "",
        returnvalue: "",
    });
};
/**
 *
 */
export const pushUpdateChatRoom = async (
    message: APIType.WebSocketType.UserSentEventReturn,
    chatRoomId: Types.ObjectId,
    chatUserId: Types.ObjectId,
) => {
    const chatRoom = await ChatRoom.findById(chatRoomId);
    const chatUser = await ChatUser.findById(chatUserId);
    if (!chatRoom || !chatUser) {
        logger.error("No push chat room data");
        return;
    }
    logger.debug(`Update producer ${chatRoom}, ${chatUser._id.toString()}`);
    updateChatRoomProducer.publishEvent({
        eventName: chatUser._id.toString(),
        jobId: "",
        returnvalue: JSON.stringify({ message: message, chatUser: chatUser }),
    });
};

export const pushMessageQueue = async (
    message: APIType.ContentType.MessageContentType,
    chatRoomId: Types.ObjectId,
    senderId: Types.ObjectId,
) => {
    const chatRoom = await ChatRoom.findById(chatRoomId);
    const sender = await ChatUser.findById(senderId);
    if (!chatRoom || !sender) {
        logger.error("No push chat room data");
        return;
    }
    const data = {
        message: message,
        chatRoom: chatRoom,
        sender: sender,
    };
    const jobName = `${sender._id.toString()}:${chatRoom._id.toString()}`;
    await sentMessageQueue.add(jobName, data);
};

/**
 * {userSentWorker}
 */
const userSentWorker = new Worker(
    "userSentMessage",
    async (job) => {
        const data = job.data as {
            message: APIType.ContentType.MessageContentType;
            chatRoom: ChatTypes.ChatRoomType;
            sender: ChatTypes.ChatUserType;
        };

        const chatRoom = await ChatRoom.findByIdAndUpdate(data.chatRoom, {
            $inc: { message_seq: 1 },
        });
        if (chatRoom === null) {
            logger.error("DB error");
            // throw new Error
            return;
        }
        // JSON.stringfied Buffer to buffer
        if (!(data.sender.user_id instanceof Buffer)) {
            data.sender.user_id = Buffer.from(data.sender.user_id);
        }
        /* DEBUG userSentWorker:
         {"chatRoom":{"_id":"675ba2d20e96c239403a23d0",
         "request_id":1,
         "consumer_id":{"type":"Buffer","data":[118,97,203,130,184,38,17,239,130,8,10,117,44,127,249,98]},
         "participant_ids":[
            {"type":"Buffer","data":[118,97,203,130,184,38,17,239,130,8,10,117,44,127,249,98]},
            {"type":"Buffer","data":[118,97,205,38,184,38,17,239,130,8,10,117,44,127,249,98]}],
            "message_seq":25,
            "title":"",
            "created_at":"2024-12-13T02:58:26.344Z",
            "updated_at":"2024-12-13T02:58:26.556Z","__v":0},
            "message":{"content":"Ah yeah29","contentType":"text"},
            "sender":{"_id":"675ba2d20e96c239403a22fe",
                    "user_id":{"type":"Buffer","data":[118,97,205,38,184,38,17,239,130,8,10,117,44,127,249,98]},
                    "user_name":"test1",
                    "multilingual":[],
                    "user_name_glb":{"en":"test1"},
                    "email":"test1@test.com",
                    "image_url":"",
                    "created_at":"2024-12-13T02:58:26.272Z",
                    "updated_at":"2024-12-13T02:58:26.272Z","
                    __v":0}} 
        */
        logger.debug(`userSentWorker: ${JSON.stringify(data)}`);
        console.log(data);
        if (data.message.contentType === "text") {
            const ret = await ChatContent.create({
                sender_id: data.sender.user_id,
                content: data.message.content,
                chatroom: chatRoom,
                seq: chatRoom.message_seq,
            });
            return JSON.stringify(ret.toJSON());
        }
        // TODO
        else if (data.message.contentType === "image") {
        }
        // TODO
        else {
        }
    },
    {
        connection: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
        },
    },
);

// TODO: error 처리 등을 위한 hook 코드 작성
userSentWorker.on("completed", (job) => {
    chatEventProducer.publishEvent({
        eventName: job.name,
        jobId: job.id,
        returnvalue: job.returnvalue,
    });
    logger.debug(`${job.id} has completed! ${job.name}`);
});

userSentWorker.on("failed", (job, err) => {
    logger.debug(`${job.id} has failed with ${err.message}`);
});
