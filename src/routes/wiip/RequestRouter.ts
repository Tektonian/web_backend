import express from "express";
/**
 * Middleware
 */
import { filterSessionByRBAC } from "../../middleware/auth.middleware";
/**
 * Controller
 */
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

/**
 * Enums / Utils / etc...
 */
import { APISpec } from "api_spec";
import { RequestEnum } from "api_spec/enum";
import * as Errors from "../../errors";
import logger from "../../utils/logger";

const RequestRouter = express.Router();

RequestRouter.post(
    "/" satisfies keyof APISpec.RequestAPISpec,
    // Check session
    filterSessionByRBAC(),
    (async (req, res) => {
        logger.info("START-User creating RequestModel data");
        // TODO: add validataion later
        const { data, role } = req.body;

        const user = res.session!.user;

        if (!user.roles.includes(role)) {
            throw new Errors.ServiceExceptionBase("User tried to write a request with unauthorized identity");
        }

        const request_id = await createRequest(user.id, role, data);

        if (!request_id) {
            throw new Errors.ServiceErrorBase(
                "Something went wrong. Data should be created or error must be thrown at controller level",
            );
        }

        res.json({ request_id: request_id });
        logger.info("START-User creating RequestModel data");
    }) as APISpec.RequestAPISpec["/"]["post"]["handler"],
);

RequestRouter.get("/:request_id" satisfies keyof APISpec.RequestAPISpec, (async (req, res) => {
    logger.info("START-User requested RequestModel data");
    // TODO: add schema
    const request_id = req.params.request_id;

    const request = (await getRequestByRequestId(Number(request_id)))?.get({
        plain: true,
    });

    if (!request) {
        throw new Errors.ServiceExceptionBase("User sent non exist request_id");
    }

    res.json({ data: request, status: "ok" });

    logger.info("END-User requested RequestModel data");
}) as APISpec.RequestAPISpec["/:request_id"]["get"]["__handler"]);

RequestRouter.post(
    "/status/contract",
    // Login first
    filterSessionByRBAC(),
    async (req, res) => {
        logger.info("START-Update Request status to Contract");

        const sessionUser = res.session!.user;

        // TODO: add schema
        const { request_id } = req.body;

        const request = (await getRequestByRequestId(request_id))?.get({
            plain: true,
        });

        if (!request) {
            throw new Errors.ServiceExceptionBase("User requets wrong request id");
        }

        const consumerUser = (await getUserByConsumerId(request.consumer_id))?.get({
            plain: true,
        });

        if (!consumerUser) {
            throw new Errors.ServiceErrorBase("Something went wrong consumer should exist");
        }
        if (consumerUser.user_id.equals(sessionUser.id)) {
            throw new Errors.ServiceExceptionBase("User requested Unauthorized request_id");
        }

        if (
            request.request_status !== RequestEnum.REQUEST_STATUS_ENUM.POSTED &&
            request.request_status !== RequestEnum.REQUEST_STATUS_ENUM.PAID
        ) {
            // TODO: remove POSTED status after payment system is implemented
            throw new Errors.ServiceExceptionBase("Illigal request. Only PAID request can be CONTRACTED status");
        }

        await updateRequestStatus(request.request_id, RequestEnum.REQUEST_STATUS_ENUM.CONTRACTED);
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

        const chatUsers = await getChatUsersByUUID(request.provider_ids as Buffer[]);

        await Promise.all(
            chatUsers.map((chatUser) => {
                sendRefreshChatRooms(chatUser._id);
            }),
        );

        const message = {
            contentType: "alarm",
            content: "contracted",
        };

        await Promise.all(
            chatRoomAll.map((room) => {
                return sendMessage(message, room._id, undefined);
            }),
        );

        // TODO: Response update chatroom

        // TODO: Add task scheduling
        // 1. send alarm for student before start (about 10 minutes ??)
        // 2. check progressing of request -> Should consider various senario, such as absence, late,
        logger.info("END-Update Request status to Contract");
    },
);

RequestRouter.post("/status/finish", filterSessionByRBAC(), async (req, res) => {
    logger.info("START-Update Request status to finish");

    const sessionUser = res.session!.user;

    // TODO: add schema
    const { request_id } = req.body;

    const request = (await getRequestByRequestId(request_id))?.get({
        plain: true,
    });

    if (request === undefined) {
        throw new Errors.ServiceExceptionBase("User requets wrong request id");
    }

    const consumerUser = (await getUserByConsumerId(request.consumer_id))?.get({
        plain: true,
    });

    if (!consumerUser) {
        throw new Errors.ServiceErrorBase("Something went wrong consumer should exist");
    }
    if (consumerUser.user_id.equals(sessionUser.id)) {
        throw new Errors.ServiceExceptionBase("User requested Unauthorized request_id");
    }

    if (request.request_status !== RequestEnum.REQUEST_STATUS_ENUM.CONTRACTED) {
        throw new Errors.ServiceExceptionBase("Illigal request. Only contracted request can be FINISHED status");
    }

    await updateRequestStatus(request.request_id, RequestEnum.REQUEST_STATUS_ENUM.FINISHED);
    // TODO: implement after actions,
    // such as remove chatrooms by request_id
    // and refersh chatroom etc...

    logger.info("END-Update Request status to finish");
});

/**
 * Update provider id list.
 * Updaing a list works as boolean flipping.
 * If user try to add one user from [1] -> [1, 2],
 * and if user try to add same user once again [1, 2] will be -> [1]
 */
RequestRouter.post(
    "/provider",
    // Login first
    filterSessionByRBAC(),
    async (req, res) => {
        logger.info("START-Update provider_ids of Request table");

        const sessionUser = res.session!.user;

        // TODO: add schema
        const { chatroom_id } = req.body;

        const chatRoom = await getChatRoomById(chatroom_id);

        if (
            !chatRoom ||
            // Only for 1:1 chatroom
            chatRoom.participant_ids.length !== 2 ||
            // Only consumer of request can update status of request
            chatRoom.consumer_id !== sessionUser.id
        ) {
            throw new Errors.ServiceExceptionBase("User requets wrong chatroom id");
        }

        const request = (await getRequestByRequestId(chatRoom.request_id))?.get({
            plain: true,
        });

        if (!request) {
            throw new Errors.ServiceErrorBase("Something went wrong. request should exist");
        }

        // TODO: remove POSTED status after payment system is implemented
        if (
            request.request_status !== RequestEnum.REQUEST_STATUS_ENUM.POSTED &&
            request.request_status !== RequestEnum.REQUEST_STATUS_ENUM.PAID
        ) {
            throw new Errors.ServiceExceptionBase("Illigal request, Only paid-request can be updated");
        }
        // TODO: Check head count

        /**
         * provider_ids are saved as Stringfied Buffer but Sequelize model getter
         * will change ids into Buffer type
         * @see {@link models/rdbms/Request}
         */
        const prevProviderIds = request.provider_ids as Buffer[];

        // counterpart of a consumer in 1:1 chatroom is provider
        const selectedProviderId = chatRoom.participant_ids.find((user_id) => !user_id.equals(sessionUser.id));

        if (!selectedProviderId) {
            throw new Errors.ServiceExceptionBase("Something wrong, No provider id found");
        }

        // Boolean flipping here -> JS do not support Set<Buffer> so we have to filter one by one
        if (prevProviderIds.find((user_id) => user_id.equals(selectedProviderId))) {
            const newProviderIds = prevProviderIds.filter((user_id) => !user_id.equals(selectedProviderId));
            await updateRequestProviderIds(newProviderIds, request.request_id);
        } else {
            const newProviderIds = [...prevProviderIds, selectedProviderId];
            await updateRequestProviderIds(newProviderIds, request.request_id);
        }

        logger.info("END-Update provider_ids of Request table");
    },
);

RequestRouter.put(
    "/update" satisfies keyof APISpec.RequestAPISpec,
    // Check login
    filterSessionByRBAC(),
    (async (req, res) => {
        logger.info("START-Update request status");
        const sessionUser = res.session!.user;
        const { request_id, update } = req.body;
        const request = (await getRequestByRequestId(request_id))?.get({
            plain: true,
        });
        if (!request) {
            throw new Errors.ServiceExceptionBase("User requested wrong request_id");
        }

        const user = (await getUserByConsumerId(request.consumer_id))?.get({
            plain: true,
        });

        if (!user) {
            throw new Errors.ServiceErrorBase("Something went wrong");
        }

        const ret = await updateRequestStatus(request.request_id, update);
        if (ret === undefined) {
            throw new Errors.ServiceErrorBase("Something went wrong. Db update failed");
        }

        logger.info(`END-Update request status`);
    }) as APISpec.RequestAPISpec["/update"]["patch"]["__handler"],
);

export default RequestRouter;
