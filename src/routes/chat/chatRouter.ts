/**
 * Router regarding chattings.
 * such as, unread message count and information about current chatrooms
 */
import { Router } from "express";
import { models } from "../../models/rdbms";

import * as ChatRoomController from "../../controllers/chat/chatRoomController";
import { getUsersByUUID } from "../../controllers/chat/chatUserController";
import { getUserByConsumerId } from "../../controllers/UserController";
import { getUnreadCountOfUser } from "../../controllers/chat/chatUnreadController";
import {
    addProviderIdToRequest,
    getRequestByRequestId,
} from "../../controllers/wiip/RequestController";

import logger from "../../utils/logger";

const ChatRouter = Router();

const { User, Request } = models;

const {
    actionCompleteRecruit,
    createChatRoom,
    getChatRoomById,
    getAliveChatRoomsByUser,
} = ChatRoomController;

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

ChatRouter.get("/chatroom", async (req, res, next) => {
    const sessionUser = res.session.user;
    if (sessionUser === undefined) res.json("No session");
    const dbUserData = await User.findOne({
        where: { email: sessionUser.email },
        attributes: ["user_id", "username", "email"],
    });
    const chatRooms = await getAliveChatRoomsByUser(dbUserData?.dataValues);

    const ResChatRoomFactory = async (chatRoom: IChatroom): ResChatRoom => {
        const consumer = await getUserByUUID(chatRoom.consumer_id);
        const participants = await getUsersByUUID(chatRoom.participant_ids);
        const consumerName = consumer?.username;
        const participantNames = participants.map((part) => part.username);
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
        const prevProviderIds = (request.student_ids ?? []) as Buffer[];

        const newProviderIdStr = chatRoom
            .toObject()
            .participant_ids.find(
                (id) =>
                    !(sessionUser.id as Buffer).equals(
                        Buffer.from(id.toJSON(), "base64"),
                    ),
            );
        console.log(newProviderIdStr, chatRoom.toJSON());
        const newProviderId = Buffer.from(newProviderIdStr?.toJSON(), "base64");

        console.log(newProviderId, newProviderIdStr);
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

export default ChatRouter;
