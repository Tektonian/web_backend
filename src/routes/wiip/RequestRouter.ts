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
    getRequestsByCorpId,
    getRequestByRequestId,
    updateRequestProviderIds,
    updateRequestStatus,
    getRequestsByOrgnId,
} from "../../controllers/wiip/RequestController";
import { getUserByConsumerId, getUserByStudentId } from "../../controllers/UserController";
import { getChatUserByUUID, getChatUsersByUUID } from "../../controllers/chat/chatUserController";
import {
    actionCompleteRecruit,
    getChatRoomById,
    sendRefreshChatRooms,
} from "../../controllers/chat/chatRoomController";
import { sendMessage } from "../../controllers/chat/chatContentController";

/**
 * MongoDB Model: TODO -> Should remove later
 */
import { ChatRoom } from "../../models/chat";
/**
 * Enums / Utils / etc...
 */
import type { RequestAttributes } from "../../models/rdbms/Request";
import { APISpec } from "api_spec";
import { RequestSchema } from "api_spec/joi";
import { RequestEnum } from "api_spec/enum";
import * as Errors from "../../errors";
import { ValidateSchema } from "../../utils/validation.joi";
import logger from "../../utils/logger";
import { omit } from "es-toolkit";
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
        logger.info("END-User creating RequestModel data");
    }) as APISpec.RequestAPISpec["/"]["post"]["handler"],
);

RequestRouter.post(
    "/list" satisfies keyof APISpec.RequestAPISpec,
    // Check session
    filterSessionByRBAC(["normal", "student", "corp", "orgn"]),
    (async (req, res) => {
        logger.info("START-Request card list");
        const { student_id, corp_id, orgn_id } = ValidateSchema(RequestSchema.ReqAllRequestCardSchema, req.body);

        const sessionUser = res.session!.user;
        const userRoles = new Set(sessionUser.roles);

        let requestList: RequestAttributes[] = [];
        // For student profile page
        if (student_id) {
            const studentUser = await getUserByStudentId(student_id);
            if (!studentUser) {
                throw new Errors.ServiceExceptionBase("User requested wrong student_id");
            }
            // TODO: need provider table -> we will use MongoDB data for now
            const chatRooms = await ChatRoom.find({
                $and: [
                    // Finished Requests are set to be less than 0
                    { request_id: { $lte: 0 } },
                    // Student user participated in a finished request
                    { participant_ids: { $in: [studentUser.user_id] } },
                    // And student user is not a consumer
                    { consumer_id: { $ne: studentUser.user_id } },
                ],
            });
            const requestIds = chatRooms.map((room) => room.request_id * -1);

            requestList = (await Promise.all(requestIds.map((id) => getRequestByRequestId(id))))
                .filter((val) => val !== null)
                .map((req) => req.get({ plain: true }));

            // If user is not orgn or corp
            // filter requests posted by orgn or corp
            if (userRoles.intersection(new Set(["orgn", "corp"])).size === 0) {
                requestList.filter((val) => {
                    if (val.corp_id === undefined && val.orgn_id === undefined) {
                        return false;
                    }
                    return true;
                });
            }
            requestList.filter((req) => req.request_status === RequestEnum.REQUEST_STATUS_ENUM.FINISHED);
        }
        // For Orgn or Corp profile page
        else {
            if (userRoles.intersection(new Set(["orgn", "corp", "student"])).size === 0) {
                requestList = [];
            } else if (corp_id) {
                requestList = (await getRequestsByCorpId(corp_id)).map((req) => req.get({ plain: true }));
            } else if (orgn_id) {
                requestList = (await getRequestsByOrgnId(orgn_id)).map((req) => req.get({ plain: true }));
            }
            requestList.filter(
                (req) =>
                    req.request_status === RequestEnum.REQUEST_STATUS_ENUM.POSTED ||
                    req.request_status === RequestEnum.REQUEST_STATUS_ENUM.PAID ||
                    req.request_status === RequestEnum.REQUEST_STATUS_ENUM.FINISHED,
            );
        }

        res.json({
            requests: requestList.map((req) => ({
                request_id: req.request_id,
                title: req.title,
                reward_price: req.reward_price,
                currency: req.currency,
                address: req.address,
                start_date: req.start_date,
                request_status: req.request_status as RequestEnum.REQUEST_STATUS_ENUM,
            })),
        });

        logger.info("END-Request card list");
    }) as APISpec.RequestAPISpec["/list"]["get"]["handler"],
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

    res.json(omit(request, ["provider_ids"]));

    logger.info("END-User requested RequestModel data");
}) as APISpec.RequestAPISpec["/:request_id"]["get"]["handler"]);

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
        if (!consumerUser.user_id.equals(sessionUser.id)) {
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

        const providerIds = request.provider_ids as Buffer[];
        const chatUsers = await getChatUsersByUUID([consumerUser.user_id, ...providerIds]);

        await Promise.all(
            chatUsers.map((chatUser) => {
                return sendRefreshChatRooms(chatUser._id);
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
        res.status(202).end();
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
        const { chatroom_ids, request_id } = req.body;

        const newProviderIds: Buffer[] = [];

        const request = (await getRequestByRequestId(request_id))?.get({
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

        for (const chatroom_id of chatroom_ids) {
            const chatRoom = await getChatRoomById(chatroom_id);

            if (!chatRoom) {
                throw new Errors.ServiceExceptionBase("User requested Non-exist chatroom");
            } else if (chatRoom.participant_ids.length !== 2) {
                throw new Errors.ServiceExceptionBase("Updating provider ids is exclusively allowed for 1:1 chatroom");
            } else if (!chatRoom.consumer_id.equals(sessionUser.id)) {
                throw new Errors.ServiceExceptionBase("Non consumer user tried to update provider list");
            } else if (request.request_id !== chatRoom.request_id) {
                throw new Errors.ServiceExceptionBase("User sent different request_id");
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

            newProviderIds.push(selectedProviderId);
        }

        await updateRequestProviderIds(newProviderIds, request_id);
        const chatUser = await getChatUserByUUID(sessionUser.id);

        if (chatUser) {
            logger.info("INTER-Update provider_ids succeed send chatUser to update chatrooms");
            sendRefreshChatRooms(chatUser._id);
        }

        res.status(202).end();
        logger.info("END-Update provider_ids of Request table");
        return;
    },
);

/**
 * @deprecated
 */
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
    }) as APISpec.RequestAPISpec["/update"]["put"]["__handler"],
);

export default RequestRouter;
