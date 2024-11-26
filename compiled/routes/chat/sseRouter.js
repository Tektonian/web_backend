import SSE from "sse";
import { QueueEvents } from "bullmq";
const sendSSEAlarm = new QueueEvents("sendAlarm");
export default function initSSE(httpServer) {
    const sse = new SSE(httpServer);
    sse.on("connection", (client) => {
        console.log("SSE connected: ", client);
    });
    sse.on();
    return sse;
}
