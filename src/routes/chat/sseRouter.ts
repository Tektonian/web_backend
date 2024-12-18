import { Router } from "express";
import { createSession } from "better-sse";
import { QueueEvents } from "bullmq";
import { getUnreadCountOfUser } from "../../controllers/chat/chatUnreadController";
import { getRequestsByUserId } from "../../controllers/wiip/RequestController";
import { getCorpReviewsByRequestId } from "../../controllers/CorporationReveiwController";
import { getStudentReviewsByRequestId } from "../../controllers/wiip/StudentReviewController";

import logger from "../../utils/logger";
import { RequestEnum } from "api_spec/enum";

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

    const ret = await getUnreadCountOfUser(user.id);

    session.push({ unreadTotalCount: ret });

    const callback = ({ jobId, returnvalue }) => {
        logger.debug(`sseEvent: ${session}, `);
        session.push(returnvalue, "message");
    };
    logger.debug(`SSE connected: ${user.id.toString("hex")}`);
    sendSSEAlarm.on(`${user.id.toString("hex")}`, callback);

    session.on("disconnected", () => {
        logger.debug("SSE disconnected");
        sendSSEAlarm.removeAllListeners(`${user.id.toString("hex")}`);
    });
});
// TODO: 회원가입 후에 미 인증 시에 보낼 알람 추가
// TODO: 국적 / 활동 국가 미 입력 시 보낼 알람 추가

// TODO: 알람 설계 추가적으로 고려해야할 로직 필요
// 1. 학생과 컨수머 2개 모두 가진경우? (e.g. 학생 / 기업) (그냥 마이페이지로 넘어가기?)
// 2. 몇번 보여줄거인지에 대한 고려 필요 -> (e.g. 하루동안 보지않기 같은 -> 프론트 처리?)
SSEAlarmRouter.get("/review", async (req, res) => {
    const session = await createSession(req, res, {
        headers: { "access-control-allow-credentials": "true" },
    });

    if (res.session === undefined || res.session.user === undefined) {
        return;
    }

    const sessionUser = res.session.user;

    const requests = await getRequestsByUserId(sessionUser.id as Buffer);

    const freshRequests = requests.filter(
        (req) =>
            // Request is done
            req.request_status === RequestEnum.REQUEST_STATUS_ENUM.FINISHED &&
            // And less then 4 days after done
            new Date().getDay() - new Date(req.end_date ?? 0).getDay() < 4,
    );

    /**
     * TODO: Discussion needed
     * 1. 리뷰 작성 조건
     * 2. 리뷰 작성 플로우 (마이페이지로 넘어가게 할 것인가? 또는 바로 리뷰 작성페이지로?, 아니면 두 개 다?)
     */
    if (freshRequests.length !== 0) {
        session.push({ review: true });
    }
});

export default SSEAlarmRouter;
