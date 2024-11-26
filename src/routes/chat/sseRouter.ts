import { Router } from "express";
import { createSession } from "better-sse";
import { QueueEvents } from "bullmq";

const sendSSEAlarm = new QueueEvents("sendAlarm");

const SSEAlarmRouter = Router();

SSEAlarmRouter.get("/", async (req, res) => {
    const session = await createSession(req, res, {
        headers: { "access-control-allow-credentials": "true" },
    });
    if (res.session === undefined || res.session.user === undefined) {
        return;
    }

    const user = res.session.user;

    const callback = ({ jobId, returnvalue }) => {
        console.log("sseEvent: ", session);
        session.push(returnvalue, "message");
    };
    console.log("SSE connected: ", user.id.toString("hex"));
    sendSSEAlarm.on(`${user.id.toString("hex")}`, callback);

    session.on("disconnected", () => {
        console.log("SSE disconnected");
        sendSSEAlarm.off(`${user.id.toString("hex")}`, callback);
    });
});

export default SSEAlarmRouter;
