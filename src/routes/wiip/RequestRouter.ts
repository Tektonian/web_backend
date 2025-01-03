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
    getRequestsByUserId,
    getRequestsByProviderUserId,
} from "../../controllers/wiip/RequestController";
import { getUserByConsumerId, getUserByStudentId } from "../../controllers/UserController";
import { getChatUserByUUID, getChatUsersByUUID } from "../../controllers/chat/chatUserController";
import {
    actionCompleteRecruit,
    getChatRoomById,
    sendRefreshChatRooms,
} from "../../controllers/chat/chatRoomController";
import { getProvidersByRequest } from "../../controllers/wiip/ProviderController";
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
import { omit, pick } from "es-toolkit";
import { checkUserIsCorpnWorker, getCorpByCorpId } from "../../controllers/wiip/CorporationController";
import { checkUserIsOrgnWorker, getOrgnByOrgnId } from "../../controllers/wiip/OrganizationController";
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

RequestRouter.get(
    "/list/mypage" satisfies keyof APISpec.RequestAPISpec,
    // Need login
    filterSessionByRBAC(),
    (async (req, res) => {
        logger.info("START-Get mypage request card");
        const sessionUser = res.session!.user;

        // Get request list of consumer identity
        const requestList = (await getRequestsByUserId(sessionUser.id)).map((req) => req.get({ plain: true }));

        // Get request list of provider identity
        (await getRequestsByProviderUserId(sessionUser.id)).forEach((req) => {
            requestList.push(req.get({ plain: true }));
        });

        const requestCards = requestList.map((req) =>
            pick(req, ["request_id", "title", "reward_price", "currency", "address", "start_date", "request_status"]),
        );

        res.status(200).json({ requests: requestCards });
        logger.info("END-Get mypage request card");
    }) as APISpec.RequestAPISpec["/list/mypage"]["get"]["handler"],
);

/**
 * For student profile page
 */
RequestRouter.post(
    "/list/student" satisfies keyof APISpec.RequestAPISpec,
    // Check session
    filterSessionByRBAC(["normal", "student", "corp", "orgn"]),
    (async (req, res) => {
        logger.info("START-Get student request card list");

        const { student_id } = ValidateSchema(RequestSchema.ReqAllRequestCardSchema, req.body);
        const sessionUser = res.session!.user;
        const userRoles = new Set(sessionUser.roles);
        if (!student_id) {
            throw new Errors.ServiceExceptionBase("User requested wrong student_id");
        }

        const studentUser = (await getUserByStudentId(student_id))?.get({ plain: true });
        if (!studentUser) {
            throw new Errors.ServiceExceptionBase("User requested wrong student_id");
        }

        const isMyData = sessionUser.id.equals(studentUser.user_id);

        let requestList = (await getRequestsByProviderUserId(studentUser.user_id)).map((req) =>
            req.get({ plain: true }),
        );

        // If is not my data, only show finished requests
        if (isMyData !== true) {
            requestList = requestList.filter((req) => req.request_status === RequestEnum.REQUEST_STATUS_ENUM.FINISHED);

            // If user is not corp or orgn, than filter corp or orgn requests
            if (!userRoles.has("corp") || !userRoles.has("orgn")) {
                requestList = requestList.filter((req) => req.corp_id !== undefined || req.orgn_id !== undefined);
            }
        }

        const requestCards = requestList.map((req) =>
            pick(req, ["request_id", "title", "reward_price", "currency", "address", "start_date", "request_status"]),
        );

        res.status(200).json({ requests: requestCards });

        logger.info("END-Get student request card list");
    }) as APISpec.RequestAPISpec["/list/student"]["post"]["handler"],
);
/*
 * For corp profile page
 */
RequestRouter.post(
    "/list/corp" satisfies keyof APISpec.RequestAPISpec,
    // Check session
    filterSessionByRBAC(["student", "corp", "orgn"]),
    (async (req, res) => {
        logger.info("START-Get corp request card list");

        const { corp_id } = ValidateSchema(RequestSchema.ReqAllRequestCardSchema, req.body);
        const sessionUser = res.session!.user;
        const userRoles = new Set(sessionUser.roles);

        if (!corp_id) {
            throw new Errors.ServiceExceptionBase("User requested wrong corp_id");
        }

        const corporation = await getCorpByCorpId(corp_id);

        if (!corporation) {
            throw new Errors.ServiceExceptionBase("User requested non-exist corp_id");
        }
        const isMyCompany = await checkUserIsCorpnWorker(sessionUser.id, corporation.corp_id);

        let requestList = (await getRequestsByCorpId(corporation.corp_id)).map((req) => req.get({ plain: true }));

        // If user is not a company worker, only show finished request
        if (isMyCompany === undefined) {
            requestList = requestList.filter((req) => req.request_status === RequestEnum.REQUEST_STATUS_ENUM.FINISHED);

            // If user is not corp nor orgn, than filter corp or orgn requests
            if (!userRoles.has("corp") && !userRoles.has("orgn")) {
                requestList = requestList.filter((req) => req.corp_id !== undefined || req.orgn_id !== undefined);
            }
        }

        const requestCards = requestList.map((req) =>
            pick(req, ["request_id", "title", "reward_price", "currency", "address", "start_date", "request_status"]),
        );

        res.status(200).json({ requests: requestCards });

        logger.info("END-Get corp request card list");
    }) as APISpec.RequestAPISpec["/list/corp"]["post"]["handler"],
);

/*
 * For orgn profile page
 */
RequestRouter.post(
    "/list/orgn" satisfies keyof APISpec.RequestAPISpec,
    // Check session
    filterSessionByRBAC(["student", "corp", "orgn"]),
    (async (req, res) => {
        logger.info("START-Get orgn request card list");

        const { orgn_id } = ValidateSchema(RequestSchema.ReqAllRequestCardSchema, req.body);
        const sessionUser = res.session!.user;
        const userRoles = new Set(sessionUser.roles);

        if (!orgn_id) {
            throw new Errors.ServiceExceptionBase("User requested wrong corp_id");
        }

        const organization = await getOrgnByOrgnId(orgn_id);

        if (!organization) {
            throw new Errors.ServiceExceptionBase("User requested non-exist corp_id");
        }
        const isMyCompany = await checkUserIsOrgnWorker(sessionUser.id, organization.orgn_id);

        let requestList = (await getRequestsByOrgnId(organization.orgn_id)).map((req) => req.get({ plain: true }));

        // If user is not a company worker, only show finished request
        if (isMyCompany === undefined) {
            requestList = requestList.filter((req) => req.request_status === RequestEnum.REQUEST_STATUS_ENUM.FINISHED);

            // If user is not corp nor orgn, than filter corp or orgn requests
            if (!userRoles.has("corp") && !userRoles.has("orgn")) {
                requestList = requestList.filter((req) => req.corp_id !== undefined || req.orgn_id !== undefined);
            }
        }

        const requestCards = requestList.map((req) =>
            pick(req, ["request_id", "title", "reward_price", "currency", "address", "start_date", "request_status"]),
        );

        res.status(200).json({ requests: requestCards });

        logger.info("END-Get orgn request card list");
    }) as APISpec.RequestAPISpec["/list/orgn"]["post"]["handler"],
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

    res.json(request);

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

        const providerIds = (await getProvidersByRequest(request.request_id)).map((provider) =>
            provider.getDataValue("user_id"),
        );

        const chatRoomAll = await actionCompleteRecruit(request.request_id, sessionUser.id as Buffer, providerIds);

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
        logger.info("START-Update provider list of Request");

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
            logger.info("INTER-Update provider list succeed send chatUser to update chatrooms");
            sendRefreshChatRooms(chatUser._id);
        }

        res.status(202).end();
        logger.info("END-Update provider list of Request");
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
