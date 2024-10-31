import * as chatModels from "../../models/chat";
import { Queue, Worker } from "bullmq";
import type { Document } from "mongoose";
const chatContentQueue = new Queue("chatContent");

export const pushMessageQueue = async (
    chatRoom_id: string,
    message: string,
    sender_id: string,
) => {
    const data = {
        chatRoom_id: chatRoom_id,
        message: message,
        sender_id: sender_id,
    };
    await chatContentQueue.add(chatRoom_id, data);
};

const worker = new Worker(
    "chatContent",
    async (job) => {
        const data = job.data;
        const chatRoom_id = data.chatRoom_id;

        const sender = await chatModels.chatUser.findById(data.sender_id);
        const chatRoom = await chatModels.chatRoom.findByIdAndUpdate(
            chatRoom_id,
            { $inc: { message_seq: 1 } },
        );
        await chatModels.chatContent.create({
            sender_id: sender._id,
            message: data.message,
            chatroom_id: chatRoom._id,
            seq: chatRoom?.message_seq,
        });
    },
    {
        connection: {
            host: "localhost",
            port: 6379,
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
