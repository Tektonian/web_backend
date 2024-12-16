/**
 * Router regarding chattings.
 * such as, unread message count and information about current chatrooms
 */
import { Router } from "express";
import { models } from "../../models/rdbms";

import * as ChatRoomController from "../../controllers/chat/chatRoomController";
import {
    getChatUsersByUUID,
    getChatUserByUUID,
} from "../../controllers/chat/chatUserController";
import { getUserByConsumerId } from "../../controllers/UserController";
import { getUnreadCountOfUser } from "../../controllers/chat/chatUnreadController";
import {
    updateRequestProviderIds,
    getRequestByRequestId,
    updateRequestStatus,
} from "../../controllers/wiip/RequestController";
import {
    getChatRoomMessagesByContentType,
    sendMessage,
} from "../../controllers/chat/chatContentController";
import { getStudentByUserId } from "../../controllers/wiip/StudentController";

import logger from "../../utils/logger";

import { RequestEnum } from "api_spec/enum";
import {
    AlarmMessageGlb,
    AlarmMessageGlbEnum,
} from "../../global/text/chat/alarm";

const ChatRouter = Router();

const { User, Request } = models;

const {
    actionCompleteRecruit,
    createChatRoom,
    getChatRoomById,
    getAliveChatRoomsByUser,
} = ChatRoomController;

/**
 * @deprecated
 */
ChatRouter.post("/unread", async (req, res) => {
    const sessionUser = res.session?.user;
    if (sessionUser === undefined) res.json("No session");

    const ret = await getUnreadCountOfUser(sessionUser.id);

    res.json({ unreadCount: ret });
});

ChatRouter.post("/chatroom", async (req, res) => {
    const { request_id } = req.body;
    const sessionUser = res.session?.user;

    if (sessionUser === undefined) {
        res.json({ status: "No session" });
        return;
    } else if (!sessionUser.roles.includes("student")) {
        res.json({ status: "No student user" });
        return;
    }

    const userInstance = (
        await User.findOne({
            where: { user_id: sessionUser.id },
        })
    )?.get({ plain: true });

    const reqeustInstance = (
        await Request.findOne({
            where: { request_id: request_id },
            include: {},
        })
    )?.get({ plain: true });

    if (userInstance === undefined || reqeustInstance === undefined) {
        res.json({ status: "Db error" });
        return;
    }

    const consumerInstance = await getUserByConsumerId(
        reqeustInstance.consumer_id,
    );

    if (consumerInstance === undefined) {
        res.json({ status: "Db error" });
        return;
    }

    const chatRoom = await createChatRoom(
        reqeustInstance.request_id,
        consumerInstance.user_id,
        [consumerInstance.user_id, userInstance.user_id],
    );

    res.json({ status: "ok" });
    return;
});

/**
 * @deprecated
 */
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

ChatRouter.delete("/chatroom", (req, res) => {
    const { chatRoomId, tempId } = req.body;

    const sessionUser = res.session.user;
});

ChatRouter.post("/request/status/contract", async (req, res) => {
    logger.info("START-Update Request status to Contract");

    const sessionUser = res.session?.user;

    if (sessionUser === undefined) {
        res.json("Login first");
        return;
    }

    const { request_id } = req.body;

    const request = (await getRequestByRequestId(request_id))?.get({
        plain: true,
    });

    if (request === undefined) {
        res.json("Wrong Data structure or Db error");
        return;
    }

    const consumerUser = (await getUserByConsumerId(request.consumer_id))?.get({
        plain: true,
    });

    if (consumerUser === undefined || sessionUser.id !== consumerUser.user_id) {
        res.json("Warning Illigal request!!");
        return;
    }

    if (
        request.request_status !== RequestEnum.REQUEST_STATUS_ENUM.POSTED &&
        request.request_status !== RequestEnum.REQUEST_STATUS_ENUM.PAID
    ) {
        // TODO: remove POSTED status after payment system is implemented
        res.json("Warning Illigal request!!");
        return;
    }

    await updateRequestStatus(
        request.request_id,
        RequestEnum.REQUEST_STATUS_ENUM.CONTRACTED,
    );
    /**
     * Once request_status changed into CONTRACTED, several things should be set
     * 1. Update Chat Rooms.
     *      1. Remove needless chatroom which Non-provider participated in
     *      2. Create one group chatroom
     *      3. Response users to update chatroom
     * 2. Schedule alarms
     *      1. Student have to send alarm which alert 'I'm arrived' before start_time in Request table
     *          (It will be handled at {@link check-attending})
     *      2. We will send push-alarm through mobile phone, so students don't forget sending alarm
     *      3. During working several exceptions may occur
     *          1. Consumer didn't respond to providers(students) check-attending alarm
     *          2. Provider falsely send alarm
     *          3. Provider(students) absent
     *          4. etc...
     *      4. To sum up, we should schedule 2 alarms, one for student and one for request_status checking
     */

    const chatRoomAll = await actionCompleteRecruit(
        request.request_id,
        sessionUser.id as Buffer,
        request.provider_ids as Buffer[],
    );

    const chatUsers = await getChatUsersByUUID(
        request.provider_ids as Buffer[],
    );

    await Promise.all(
        chatUsers.map((chatUser) => {
            ChatRoomController.sendRefreshChatRooms(chatUser._id);
        }),
    );

    const message = {
        content_type: "alarm",
        content: "contracted",
    };

    await Promise.all(
        chatRoomAll.map((room) => {
            return sendMessage(room._id, sessionUser._id, message);
        }),
    );

    // TODO: Response update chatroom

    // TODO: Add task scheduling
    // 1. send alarm for student before start (about 10 minutes ??)
    // 2. check progressing of request -> Should consider various senario, such as absence, late,
    logger.info("END-Update Request status to Contract");
});

ChatRouter.post("/request/status/finish", async (req, res) => {
    logger.info("START-Update Request status to finish");

    const sessionUser = res.session?.user;

    if (sessionUser === undefined) {
        res.json("Login first");
        return;
    }

    const { request_id } = req.body;

    const request = (await getRequestByRequestId(request_id))?.get({
        plain: true,
    });

    if (request === undefined) {
        res.json("Wrong Data structure or Db error");
        return;
    }

    const consumerUser = (await getUserByConsumerId(request.consumer_id))?.get({
        plain: true,
    });

    if (consumerUser === undefined || sessionUser.id !== consumerUser.user_id) {
        res.json("Warning Illigal request!!");
        return;
    }

    if (request.request_status !== RequestEnum.REQUEST_STATUS_ENUM.CONTRACTED) {
        res.json("Warning Illigal request!!");
        return;
    }

    await updateRequestStatus(
        request.request_id,
        RequestEnum.REQUEST_STATUS_ENUM.FINISHED,
    );
    // TODO: implement after actions,
    // such as remove chatrooms by request_id
    // and refersh chatroom etc...

    logger.info("END-Update Request status to finish");
});

ChatRouter.post("/request/provider", async (req, res) => {
    logger.info("START-Update provider_ids of Request table");

    const sessionUser = res.session?.user;

    if (sessionUser === undefined) {
        res.json("Login first");
        return;
    }
    const { chatroom_id } = req.body;

    const chatRoom = await getChatRoomById(chatroom_id);

    if (
        chatRoom === null ||
        chatRoom.participant_ids.length !== 2 ||
        chatRoom.consumer_id !== sessionUser.id
    ) {
        res.json("Wrong chatroom_id input or DB error");
        return;
    }

    const request = (await getRequestByRequestId(chatRoom.request_id))?.get({
        plain: true,
    });

    if (request === undefined) {
        res.json("Wrong Data structure or Db error");
        return;
    }

    // TODO: remove POSTED status after payment system is implemented
    if (
        request.request_status !== RequestEnum.REQUEST_STATUS_ENUM.POSTED &&
        request.request_status !== RequestEnum.REQUEST_STATUS_ENUM.PAID
    ) {
        res.json("Warning Illigal request!!");
        return;
    }

    /**
     * provider_ids are saved as Stringfied Buffer but Sequelize model getter
     * will change ids into Buffer type
     * @see {@link models/rdbms/Request}
     */
    const prevProviderIds = request.provider_ids as Buffer[];

    // counterpart of a consumer in chatroom is provider
    const selectedProviderId = chatRoom.participant_ids.find(
        (id) => !id.equals(sessionUser.id as Buffer),
    );

    if (selectedProviderId === undefined) {
        res.json("Wrong user");
        return;
    }

    const newProviderIds = [...prevProviderIds, selectedProviderId].filter(
        (id) => !id.equals(selectedProviderId),
    );

    await updateRequestProviderIds(newProviderIds, request.request_id);

    res.json("Success");

    logger.info("END-Update provider_ids of Request table");
});

// TODO: Approve 요청 유연하게 바꿀 수 있도록하기
// 1. 제공자 선택을 바꿀 수 있게하기
// 2. 제공자 인원수가 채워지고 난 다음에 request_status를 바꿀 수 있도록 하기
/**
 * @deprecated
 */
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

        const request = (await getRequestByRequestId(chatRoom.request_id))?.get(
            {
                plain: true,
            },
        );

        if (request === undefined || chatRoom === null) {
            res.json("Db error");
            return;
        }

        // Check data validity
        if (request.request_id !== chatRoom.request_id) {
            res.json("Wrong request");
            return;
        }
        /*
        TODO; add later
        if (![0, 1].includes(request.request_status ?? -1)){
            res.json("wrong request status");
            return;
        }
        */
        const prevProviderIds = (request.provider_ids ?? []) as Buffer[];

        const newProviderId = chatRoom.participant_ids.find(
            (id) => !id.equals(sessionUser.id as Buffer),
        );

        if (newProviderId === undefined) {
            res.json("Something wrong");
            return;
        }

        if (prevProviderIds.length + 1 === request.head_count) {
            await addProviderIdToRequest(newProviderId, request.request_id);
            await actionCompleteRecruit(
                request.request_id,
                sessionUser.id as Buffer,
                [...prevProviderIds, newProviderId],
            );
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
// TODO: Add RBAC middleware
ChatRouter.post("/check-attending", async (req, res) => {
    logger.info("START-Check attending request");
    const { request_id } = req.body;
    const sessionUser = res.session?.user;

    if (sessionUser === undefined) {
        res.json("login first");
        return;
    }
    // Start check validation

    const student = (await getStudentByUserId(sessionUser.id))?.get({
        plain: true,
    });
    const request = (await getRequestByRequestId(request_id))?.get({
        plain: true,
    });

    if (!student || !request) {
        logger.warn(`No such data`);
        res.json("wrong data");
        return;
    }

    if (request.request_status !== RequestEnum.REQUEST_STATUS_ENUM.CONTRACTED) {
        logger.warn(`Only contracted request permitted`);
        res.json("Wrong request");
        return;
    }

    // Provider ideas are saved with stringifed UUID
    const stringfiedProviderIds = request.provider_ids;

    const providerIds = stringfiedProviderIds.map((id) =>
        Buffer.from(id),
    ) as Buffer[];

    const isProvider = providerIds.find((id) => id.equals(sessionUser.id));

    if (isProvider === undefined) {
        logger.warn(`Wrong provider`);
        res.json(`Wrong provider`);
        return;
    }

    const chatRoomAll = await ChatRoomController.getAliveChatRoomsByUser(
        sessionUser.id,
    );

    if (chatRoomAll === undefined) {
        logger.warn(`Could be wrong input or db error`);
        return;
    }

    const chatRoom = chatRoomAll.find(
        (room) =>
            room.request_id === request.request_id &&
            room.participant_ids.length === 2,
    );

    if (chatRoom === undefined) {
        logger.warn(`Could be wrong input`);
        return;
    }

    // Check previously sended check arrived message
    const messages = await getChatRoomMessagesByContentType(
        chatRoom._id,
        "alarm",
    );

    const text: AlarmMessageGlbEnum = "checkArrived";
    const prevMsg = messages.find((msg) => msg.content === text);

    if (prevMsg !== undefined) {
        logger.warn(`Already requested attendence check`);
        return;
    }
    // End check validation

    const alarmMessage: AlarmMessageGlbEnum = "checkArrived";

    await sendMessage(chatRoom._id, sessionUser.id, {
        contentType: "alarm",
        content: alarmMessage,
    });

    logger.info("End-Check attending request");
});

export default ChatRouter;
