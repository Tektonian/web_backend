import * as chatModels from "../../models/chat";
import { Queue, Worker } from "bullmq";
import type { Document } from "mongoose";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config({ path: ".env.local" });

// Only one queue for now
const chatContentQueue = new Queue("chatContent");

interface messageQueueDataTypes {
    chatRoom: mongoose.Types.ObjectId;
    message: any;
    sender_id: mongoose.Types.UUID;
}

export const pushMessageQueue = async (
    chatRoom: mongoose.Types.ObjectId,
    message: string,
    sender_id: mongoose.Types.UUID,
) => {
    const data: messageQueueDataTypes = {
        chatRoom: chatRoom,
        message: message,
        sender_id: sender_id,
    };
    await chatContentQueue.add(chatRoom.toString(), data);
};

const worker = new Worker(
    "chatContent",
    async (job) => {
        const data = job.data as messageQueueDataTypes;

        const chatRoom = await chatModels.chatRoom.findByIdAndUpdate(
            data.chatRoom,
            { $inc: { message_seq: 1 } },
        );

        await chatModels.chatContent.create({
            sender_id: data.sender_id,
            message: data.message,
            chatroom: chatRoom,
            seq: chatRoom?.message_seq,
        });
    },
    {
        connection: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
        },
    },
);

// TODO: error 처리 등을 위한 hook 코드 작성
worker.on("completed", (job) => {
    //console.log(`${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
    //console.log(`${job.id} has failed with ${err.message}`);
});
