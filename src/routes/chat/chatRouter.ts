/**
 * Router regarding chattings.
 * such as, unread message count and information about current chatrooms
 */
import { Router } from "express";
import { models } from "../../models/rdbms";

/**
 * Controller
 */
import * as ChatRoomController from "../../controllers/chat/chatRoomController";
import { getUserByConsumerId } from "../../controllers/UserController";
import { getRequestByRequestId } from "../../controllers/wiip/RequestController";
import { getChatRoomMessagesByContentType, sendMessage } from "../../controllers/chat/chatContentController";
import { getStudentByUserId } from "../../controllers/wiip/StudentController";

/**
 * middleware
 */
import { filterSessionByRBAC } from "../../middleware/auth.middleware";

/**
 * Enum / Util / Text
 */
import { RequestEnum } from "api_spec/enum";
import * as Errors from "../../errors";
import logger from "../../utils/logger";
import { AlarmMessageGlb, AlarmMessageGlbEnum } from "../../global/text/chat/alarm";

const ChatRouter = Router();

const { User, Request } = models;

const { actionCompleteRecruit, createChatRoom, getChatRoomById, getAliveChatRoomsByUser } = ChatRoomController;

ChatRouter.post(
    "/chatroom",
    // Only student user can request participation as a provider
    filterSessionByRBAC(["student"]),
    async (req, res) => {
        // TODO: add validation
        const { request_id } = req.body;

        logger.info(`START-Student want to participated in a request:${request_id}`);
        const sessionUser = res.session!.user;

        const userInstance = await User.findOne({
            where: { user_id: sessionUser.id },
            raw: true,
        });

        const reqeustInstance = await Request.findOne({
            where: { request_id: request_id },
            raw: true,
        });

        if (!userInstance) {
            throw new Errors.ServiceErrorBase("Something went wrong");
        }
        if (!reqeustInstance) {
            throw new Errors.ServiceExceptionBase("User sent wrong request_id");
        }

        const consumerInstance = (await getUserByConsumerId(reqeustInstance.consumer_id))?.get({ plain: true });

        if (!consumerInstance) {
            throw new Errors.ServiceErrorBase("Something went wrong");
        }

        const chatRoom = await createChatRoom(reqeustInstance.request_id, consumerInstance.user_id, [
            consumerInstance.user_id,
            userInstance.user_id,
        ]);

        logger.info("END-Student want to participated in a request");
        res.json({ status: "ok" });
        return;
    },
);

/**
 * @deprecated
 */
/*
ChatRouter.get("/chatroom", async (req, res, next) => {
    const sessionUser = res.session.user;
    if (sessionUser === undefined) res.json("No session");
    const dbUserData = await User.findOne({
        where: { email: sessionUser.email },
        attributes: ["user_id", "username", "email"],
    });
    const chatRooms = await getAliveChatRoomsByUser(dbUserData?.dataValues);

    const ResChatRoomFactory = async (chatRoom: IChatroom): ResChatRoom => {
        const consumer = await getChatUserByUUID(chatRoom.consumer_id);
        const participants = await getChatUsersByUUID(chatRoom.participant_ids);
        const consumerName = consumer?.user_name;
        const participantNames = participants.map((part) => part.user_name);
        const resChatroom: ResChatRoom = {
            chatRoomId: chatRoom._id.toString(),
            messageSeq: chatRoom.message_seq,
            consumerName: consumerName,
            providerNames: participantNames,
        };

        return resChatroom;
    };

    const resChatRooms = await Promise.all(
        chatRooms.map((chatRoom) => ResChatRoomFactory(chatRoom)),
    );
    res.json(resChatRooms);
});
*/

ChatRouter.delete("/chatroom", (req, res) => {
    const { chatRoomId, tempId } = req.body;

    const sessionUser = res.session.user;
});

// TODO: Approve 요청 유연하게 바꿀 수 있도록하기
// 1. 제공자 선택을 바꿀 수 있게하기
// 2. 제공자 인원수가 채워지고 난 다음에 request_status를 바꿀 수 있도록 하기
/**
 * @deprecated
 */

/*
ChatRouter.put("/request", async (req, res) => {
    logger.info(`START-Approve request`);
    const sessionUser = res.session?.user;
    if (sessionUser === undefined) {
        res.json("Login first");
        return;
    }

    const { chatRoomId } = req.body;

    try {
        const chatRoom = await getChatRoomById(chatRoomId);

        if (chatRoom === null) {
            res.json("Wrong chatroom");
            return;
        }

        const request = (await getRequestByRequestId(chatRoom.request_id))?.get({
            plain: true,
        });

        if (request === undefined || chatRoom === null) {
            res.json("Db error");
            return;
        }

        // Check data validity
        if (request.request_id !== chatRoom.request_id) {
            res.json("Wrong request");
            return;
        }
        TODO; add later
        if (![0, 1].includes(request.request_status ?? -1)){
            res.json("wrong request status");
            return;
        }
        const prevProviderIds = (request.provider_ids ?? []) as Buffer[];

        const newProviderId = chatRoom.participant_ids.find((id) => !id.equals(sessionUser.id as Buffer));

        if (newProviderId === undefined) {
            res.json("Something wrong");
            return;
        }

        if (prevProviderIds.length + 1 === request.head_count) {
            await addProviderIdToRequest(newProviderId, request.request_id);
            await actionCompleteRecruit(request.request_id, sessionUser.id as Buffer, [
                ...prevProviderIds,
                newProviderId,
            ]);
        } else if (prevProviderIds.length < request.head_count) {
            await addProviderIdToRequest(newProviderId, request.request_id);
        } else {
            throw new Error("Wrong head count");
        }
    } catch (error) {
        logger.error(`Error-Approve request: ${error}`);
        return;
    }

    logger.info(`END-Approve request`);
});
*/

// Upload file or image
ChatRouter.post("/upload", async (req, res) => {
    const { tempId, chatRoomId } = req.body;

    const sessionUser = res.session?.user;

    if (sessionUser === undefined) {
        res.json("Login first");
        return;
    }
});

// Request check attending
ChatRouter.post(
    "/check-attending",
    // Only provider can send check-attending message
    filterSessionByRBAC(["student"]),
    async (req, res) => {
        logger.info("START-Check attending request");
        // TODO: add validation
        const { request_id } = req.body;

        const sessionUser = res.session!.user;

        // Start check validation
        const student = (await getStudentByUserId(sessionUser.id))?.get({
            plain: true,
        });
        const request = (await getRequestByRequestId(request_id))?.get({
            plain: true,
        });

        if (!student) {
            throw new Errors.ServiceErrorBase("User with student role should have student identity");
        }
        if (!request) {
            throw new Errors.ServiceExceptionBase("User sent non exists request_id");
        }
        if (request.request_status !== RequestEnum.REQUEST_STATUS_ENUM.CONTRACTED) {
            throw new Errors.ServiceExceptionBase("Only contracted request permitted");
        }

        const providerIds = request.provider_ids as Buffer[];

        const isProvider = providerIds.find((id) => id.equals(sessionUser.id));

        if (isProvider === undefined) {
            throw new Errors.ServiceExceptionBase("None provider of a request tried to send check-attending");
        }

        const chatRoomAll = await ChatRoomController.getAliveChatRoomsByUser(sessionUser.id);

        if (chatRoomAll === undefined) {
            throw new Errors.ServiceErrorBase(
                `Something went wrong. Contracted request should have at least one chatroom`,
            );
        }

        const chatRoom = chatRoomAll.find(
            (room) => room.request_id === request.request_id && room.participant_ids.length === 2,
        );

        if (chatRoom === undefined) {
            throw new Errors.ServiceErrorBase(
                `Something went wrong. Contracted request should have at least one 1:1 chatroom`,
            );
        }

        // Check previously sended check arrived message
        const messages = await getChatRoomMessagesByContentType(chatRoom._id, "alarm");

        const text: AlarmMessageGlbEnum = "checkArrived";
        const prevMsg = messages.find((msg) => msg.content === text);

        if (prevMsg !== undefined) {
            throw new Errors.ServiceExceptionBase(`Check-attendence-message has been sent already`);
        }
        // End check validation

        const alarmMessage: AlarmMessageGlbEnum = "checkArrived";

        await sendMessage(
            {
                contentType: "alarm",
                content: alarmMessage,
            },
            chatRoom._id,
            undefined,
        );

        logger.info("End-Check attending request");
    },
);

export default ChatRouter;
