import express from "express";
import {
    createRequest,
    getRequestByRequestId,
    updateRequestProviderIds,
    updateRequestStatus,
} from "../../controllers/wiip/RequestController";
import { getUserByConsumerId } from "../../controllers/UserController";

import { getChatUsersByUUID } from "../../controllers/chat/chatUserController";
import {
    actionCompleteRecruit,
    getChatRoomById,
    sendRefreshChatRooms,
} from "../../controllers/chat/chatRoomController";
import { sendMessage } from "../../controllers/chat/chatContentController";

import { APISpec } from "api_spec";
import { RequestEnum } from "api_spec/enum";
import logger from "../../utils/logger";

const RequestRouter = express.Router();

RequestRouter.post("/" satisfies keyof APISpec.RequestAPISpec, (async (
    req,
    res,
) => {
    const user = res.session?.user;
    const { data, role } = req.body;

    if (user === undefined) {
        res.json("Login first");
        return;
    }
    if (!user.roles.includes(role)) {
        res.json("Incorrect role");
        return;
    }

    const request_id = await createRequest(user.id, role, data);

    if (request_id === undefined) {
        res.status(500).json({ message: "Internal Server Error" });
    } else {
        res.status(201).json({
            message: "Request Body created successfully",
            request_id: request_id,
        });
    }
}) as APISpec.RequestAPISpec["/"]["post"]["__handler"]);

RequestRouter.get(
    "/:request_id" satisfies keyof APISpec.RequestAPISpec,
    (async (req, res) => {
        const request_id = req.params.request_id;
        const roles = res.session?.user.roles;

        const request = (await getRequestByRequestId(Number(request_id)))?.get({
            plain: true,
        });

        res.json({ data: request, status: "ok" });
    }) as APISpec.RequestAPISpec["/:request_id"]["get"]["__handler"],
);

RequestRouter.post("/request/status/contract", async (req, res) => {
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
            sendRefreshChatRooms(chatUser._id);
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

RequestRouter.post("/request/status/finish", async (req, res) => {
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

RequestRouter.post("/request/provider", async (req, res) => {
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
    // TODO: Check head count

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

RequestRouter.put("/update" satisfies keyof APISpec.RequestAPISpec, (async (
    req,
    res,
) => {
    logger.info("START-Update request status");
    const sessionUser = res.session?.user;
    const { request_id, update } = req.body;

    if (sessionUser === undefined) {
        res.json("Login first");
        return;
    }

    try {
        const request = (await getRequestByRequestId(request_id))?.get({
            plain: true,
        });

        if (request === undefined) {
            res.json("No such request");
            return;
        }

        const user = (await getUserByConsumerId(request.consumer_id))?.get({
            plain: true,
        });

        if (user === undefined) {
            res.json("Db error");
            return;
        }

        // Session user wrote a request
        if (!user.user_id.equals(sessionUser.id)) {
            res.json("No permission");
            return;
        }

        const ret = await updateRequestStatus(request.request_id, update);
        if (ret === undefined) {
            res.json("Update failed");
            throw new Error("Update failed");
        }
        return;
    } catch (error) {
        logger.error(`FAILED-Update request status: ${error}`);
    }

    logger.info(`END-Update request status`);
}) as APISpec.RequestAPISpec["/update"]["patch"]["__handler"]);

export default RequestRouter;
