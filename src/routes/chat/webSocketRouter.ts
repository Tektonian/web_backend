import { createHash } from "crypto";
import { QueueEvents } from "bullmq";
import { chatController } from "../../controllers/chat";
import * as UserController from "../../controllers/UserController";

import type { HydratedDocument } from "mongoose";
import type { Server, Socket } from "socket.io";
import type { Types as ChatTypes } from "../../models/chat";
import type { APIType } from "api_spec";
import type { ISessionUser } from "../../config/auth.types";
import type { UserAttributes } from "../../models/rdbms/User";

import { AlarmMessageGlb } from "../../global/text/chat/alarm";
import logger from "../../utils/logger";
import { getAliveChatRoomsByUser } from "../../controllers/chat/chatRoomController";
import { getRequestByRequestId } from "../../controllers/wiip/RequestController";
import { RequestEnum } from "api_spec/enum";

const { chatContentController, chatRoomController, chatUserController, chatUnreadController } = chatController;
const userSentEvent = new QueueEvents("userSentMessage");
const updateChatRoomEvent = new QueueEvents("updateChatRoom");
const refreshChatRoomsEvent = new QueueEvents("refreshChatRooms");
type ResSomeoneSent = APIType.WebSocketType.ResSomeoneSent;
type ResChatRoom = APIType.ChatRoomType.ResChatRoom;

/**
 *
 * @internal
 */
const EVENT_NAME_FACTORY = (
    chatUser: HydratedDocument<ChatTypes.ChatUserType>,
    chatRoom: HydratedDocument<ChatTypes.ChatRoomType>,
) => {
    return `${chatUser._id.toString()}:${chatRoom._id.toString()}`;
};
/**
 *
 * @internal
 */
const ResUserIdentityFactory = (chatUser: UserAttributes) => {
    return {
        user_name: chatUser.username ?? "",
        user_id: createHash("sha256").update(chatUser.user_id.toString("hex")).digest("hex"),
        email: chatUser.email,
        image_url: chatUser.image ?? "",
    };
};
/**
 *
 * @internal
 */
const ResChatRoomFactory = async (chatRoom: HydratedDocument<ChatTypes.ChatRoomType>): Promise<ResChatRoom> => {
    const consumer = (await UserController.getUserById(chatRoom.consumer_id))?.get({ plain: true });

    const usersUUIDs = chatRoom.participant_ids.map((id) => Buffer.from(id));
    const participantsInst = await UserController.getUsersById(usersUUIDs);

    const participants = participantsInst.map((inst) => inst.get({ plain: true }));

    const participantsRes = participants.map((part) => {
        return ResUserIdentityFactory(part);
    });
    const consumerRes = ResUserIdentityFactory(consumer);

    const lastMessage = await chatContentController.getChatRoomLastMessage(chatRoom._id);

    logger.debug(`ResChatRoomFactory: ${JSON.stringify(chatRoom)} ${JSON.stringify(lastMessage)}`);

    const resChatroom: ResChatRoom = {
        title: chatRoom.title,
        requestId: chatRoom.request_id,
        chatRoomId: chatRoom._id.toString(),
        messageSeq: chatRoom.message_seq,
        lastSenderId: createHash("sha256")
            .update(lastMessage?.sender_id?.toString("hex") ?? "")
            .digest("hex"),
        consumer: consumerRes,
        participants: participantsRes,
        lastMessage: lastMessage?.content ?? "",
        lastSentTime: lastMessage?.created_at ?? Date.now().toString(),
    };
    return resChatroom;
};
/**
 *
 * @internal
 */
const ResMessageFactory = (
    message: ChatTypes.ChatContentType,
    direction: "outgoing" | "inbound",
): APIType.WebSocketType.ResMessage => {
    let hashedSenderId: string | undefined = "";
    if (message.sender_id === undefined) {
        hashedSenderId = undefined;
    } else {
        const sender_id = message.sender_id;
        hashedSenderId = createHash("sha256").update(Buffer.from(sender_id).toString("hex")).digest("hex");
    }

    let ret = {
        _id: message._id,
        seq: message.seq,
        chatRoomId: message.chatroom,
        senderId: hashedSenderId,
        direction: direction,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    logger.debug(`Processing Message: ${message}`);
    if (message.content_type === "text") {
        return {
            ...ret,
            content: message.content,
            contentType: message.content_type,
        };
    } else if (message.content_type === "alarm") {
        return {
            ...ret,
            content: AlarmMessageGlb[message.content]?.kr?.content ?? "error",
            contentType: message.content_type,
        };
    }
};

/**
 * @internal
 */
const ResMessagesFactory = (messages: ChatTypes.ChatContentType[], chatUser: c): APIType.WebSocketType.ResMessage[] => {
    // TODO: bit wise operation later
    let ret = [];
    for (let message of messages) {
        let dir: "inbound" | "outgoing" = "inbound";
        // Room message
        if (message.sender_id === undefined) {
            dir = "inbound";
        } else {
            dir = message.sender_id.toString("hex") === chatUser.user_id.toString("hex") ? "outgoing" : "inbound";
        }
        ret.push(ResMessageFactory(message, dir));
    }
    return ret;
};

/**
 * @internal
 */

const ResRefreshFactory = async (chatUser: HydratedDocument<ChatTypes.ChatUserType>) => {
    const aliveChatRooms = (await getAliveChatRoomsByUser(chatUser.user_id)) ?? [];

    const resChatRooms = await Promise.all(aliveChatRooms.map(async (chatRoom) => ResChatRoomFactory(chatRoom)));

    const uniqueRequestIds = Array.from(new Set(aliveChatRooms.map((room) => room.request_id)));
    const requests = await Promise.all(uniqueRequestIds.map((reqId) => getRequestByRequestId(reqId)));

    const resRequests = await Promise.all(
        requests
            .filter((req) => req !== null)
            .map((req) => req.get({ plain: true }))
            .map(async (req) => {
                // List of chatroom id which selected provider is in
                const providerChatRoomIds: string[] = [];
                const isConsumer = aliveChatRooms
                    .find((val) => val.request_id === req.request_id)
                    ?.consumer_id.equals(chatUser.user_id);

                // Send selected chatroom list only for consumer
                // TODO: add PAID status and delete POSTED later
                if (isConsumer && req.request_status === RequestEnum.REQUEST_STATUS_ENUM.POSTED) {
                    const providerIds = req.provider_ids as Buffer[];
                    const providerChatRoom = aliveChatRooms
                        .filter((room) => room.request_id === req.request_id)
                        .map((room) => {
                            return room;
                        })
                        .filter(
                            (room) =>
                                providerIds.find(
                                    (providerId) =>
                                        room.participant_ids.find((partiId) => partiId.equals(providerId)) !==
                                        undefined,
                                ) !== undefined,
                        );
                    providerChatRoom.forEach((val) => providerChatRoomIds.push(val._id.toString()));
                }

                return {
                    requestId: req.request_id,
                    requestStatus: req.request_status,
                    selected: providerChatRoomIds,
                    title: req.title,
                    image: "",
                };
            }),
    );
    logger.debug(`Refresh Room Factory: ${JSON.stringify(requests)} ${JSON.stringify(resRequests)}`);

    return { chatRooms: resChatRooms, requests: resRequests };
};

/**
 * Handler function of updateChatRoom event
 * pushed event is in pushUpdateChatRoom
 * @see {@linkcode pushUpdateChatRoom}
 *
 * @param returnvalue
 *  {"message":
 *      {"chatroom":"675bc0dfbc1bef09e87622f6",
 *      "seq":0,
 *      "content_type":"text",
 *      "content":"sdf",
 *      "sender_id":{"type":"Buffer","data":[118,97,207,146,184,38,17,239,130,8,10,117,44,127,249,98]},
 *      "url":"",
 *      "_id":"675bc14ebc1bef09e87623c2",
 *      "created_at":"2024-12-13T05:08:30.212Z",
 *      "updated_at":"2024-12-13T05:08:30.212Z","__v":0},
 *  "chatUser":{
 *      "_id":"675bc132bc1bef09e87623ad",
 *      "user_id":{"type":"Buffer","data":[118,97,203,130,184,38,17,239,130,8,10,117,44,127,249,98]},
 *      "user_name":"test0",
 *      "multilingual":[],
 *      "user_name_glb":{"en":"test0"},
 *      "email":"test0@test.com",
 *      "image_url":"",
 *      "created_at":"2024-12-13T05:08:02.556Z",
 *      "updated_at":"2024-12-13T05:08:02.556Z",
 *      "__v":0}
 * }
 */
function __updateChatRoomHandler(io: Server, socket: Socket) {
    const chatUser: HydratedDocument<ChatTypes.ChatUserType> | undefined = socket.data.chatUser;

    if (!chatUser) {
        logger.error("No chat user");
        socket.disconnect(true);
        return;
    }

    const eventName = chatUser._id.toString();

    updateChatRoomEvent.on(eventName, ({ jobId, returnvalue }: any) => {
        const message: APIType.WebSocketType.UserSentEventReturn = JSON.parse(returnvalue).message;
        const direction = Buffer.from(message.sender_id).equals(chatUser.user_id) === true ? "outgoing" : "inbound";
        const ret: APIType.WebSocketType.ResMessage = ResMessageFactory(message, direction);
        logger.debug(`Update Room handler: ${JSON.stringify(ret)}, User: ${JSON.stringify(chatUser)}`);
        socket.emit("updateChatRoom", JSON.stringify(ret));
    });
}

async function __refreshChatRoomsHandler(io: Server, socket: Socket) {
    const chatUser: HydratedDocument<ChatTypes.ChatUserType> | undefined = socket.data.chatUser;

    if (!chatUser) {
        logger.error("Refresh ChatRoom: No chat user");
        socket.disconnect(true);
        return;
    }
    const eventName = chatUser._id.toString();

    refreshChatRoomsEvent.on(eventName, async ({ jobId, returnvalue }: any) => {
        const res = await ResRefreshFactory(chatUser);
        socket.emit("refreshChatRooms", res);
    });
    logger.debug(`Refresh Event handler registered: ${eventName}`);
    return;
}

/**
 * When someone send a message.
 * Messages are handled as following sequence
 * 1. Chat content controller start processing @see {@linkcode sendMessage}
 * 2. Push to message Queue @see {@linkcode pushMessageQueue}
 *  1. Depending on ContentType some messages will have different processing sequence
 * 3. If message queue worker successed a work (@see {@link userSentWorker})
 *  1. A message should be stored in Chat DB
 *  2. A message must have its own _id(ObjectId) and sequence
 * 4. Finally event handler (@see {@link userSentEventHandler}) will be called
 */
async function __sendMessageHandler(
    io: Server,
    socket: Socket,
    req: APIType.WebSocketType.ReqSendMessage,
    callback: Function,
) {
    logger.debug(`Send message Handler: Received: ${JSON.stringify(req)}`);
    const chatUser: HydratedDocument<ChatTypes.ChatUserType> | undefined = socket.data.chatUser;
    const chatRoom: HydratedDocument<ChatTypes.ChatRoomType> | undefined = socket.data.chatRoom;
    logger.debug(`Send message Handler: chatRoom: ${chatRoom}, chatUser: ${chatUser}, Message: ${JSON.stringify(req)}`);

    if (!chatUser || !chatRoom) {
        logger.error("Send Message: No chat user or chat room");
        socket.disconnect(true);
        return;
    }

    if (socket.disconnected) {
        logger.error("Disconnected User try to send a message");
        return;
    }

    if (req.senderId !== chatUser._id.toString()) {
        logger.error("Wrong chat user id");
        socket.disconnect(true);
        return;
    }

    const job = await chatContentController.sendMessage(req.message, chatRoom._id, chatUser._id);

    const jobState = await job?.getState();

    callback({
        state: jobState,
    });
}

async function __updateLastReadHandler(
    io: Server,
    socket: Socket,
    req: APIType.WebSocketType.ReqUpdateLastRead,
    callback: Function,
) {
    const { lastSeq } = req;
    const chatUser: HydratedDocument<ChatTypes.ChatUserType> | undefined = socket.data.chatUser;
    const chatRoom: HydratedDocument<ChatTypes.ChatRoomType> | undefined = socket.data.chatRoom;

    if (!chatUser || !chatRoom) {
        logger.error("Update Last Read: No chat user or chat room");
        socket.disconnect(true);
        return;
    }

    await chatUnreadController.updateUserUnreadByUUID(chatUser.user_id, chatRoom._id, lastSeq);
}

async function __userTryUnJoinHandler(
    io: Server,
    socket: Socket,
    req: APIType.WebSocketType.ReqUpdateLastRead,
    callback: Function,
) {
    const chatUser: HydratedDocument<ChatTypes.ChatUserType> | undefined = socket.data.chatUser;
    const chatRoom: HydratedDocument<ChatTypes.ChatRoomType> | undefined = socket.data.chatRoom;

    if (chatRoom && chatUser) {
        logger.debug(`User leave room: User: ${chatUser}, ChatRoom: ${chatRoom}`);
        const eventName = EVENT_NAME_FACTORY(chatUser, chatRoom);
        userSentEvent.removeAllListeners(eventName);
        socket.leave(chatRoom._id.toString());
    } else {
        logger.warn(`Something went wrong User failed to try unjoin: chatRoom:${chatRoom} chatUser:${chatUser}`);
        socket.disconnect(true);
        return;
    }
}

async function __socketDisconnectHandler(io: Server, socket: Socket, reason: string) {
    const chatUser: HydratedDocument<ChatTypes.ChatUserType> | undefined = socket.data.chatUser;

    logger.debug(`User disconnected: User: ${chatUser} Reason: ${reason}`);
    if (!chatUser) {
        logger.warn(`No Chat user`);
        return;
    }
    const eventName = chatUser._id.toString();

    updateChatRoomEvent.removeAllListeners(eventName);
    refreshChatRoomsEvent.removeAllListeners(eventName);
    await chatUserController.delChatUserById(chatUser._id);
}

/**
 * 
 * @param returnvalue
    {"chatroom":"675ba490c6a4c1d9d85ade16",
    "seq":30,
    "content_type":"text",
    "content":"asdf",
    "sender_id":{"type":"Buffer","data":[118,97,203,130,184,38,17,239,130,8,10,117,44,127,249,98]},
    "url":"",
    "_id":"675ba5abc6a4c1d9d85adee1",
    "created_at":"2024-12-13T03:10:35.175Z",
    "updated_at":"2024-12-13T03:10:35.175Z","__v":0}
 */
async function __userSentEventHandler(io: Server, socket: Socket) {
    const chatUser: HydratedDocument<ChatTypes.ChatUserType> | undefined = socket.data.chatUser;
    const chatRoom: HydratedDocument<ChatTypes.ChatRoomType> | undefined = socket.data.chatRoom;

    if (!chatUser || !chatRoom) {
        logger.error("User Sent: No chat user or chat room");
        // throw new Error("Wrong data")
        return;
    }

    const eventName = EVENT_NAME_FACTORY(chatUser, chatRoom);

    userSentEvent.on(eventName, async ({ jobId, returnvalue }: any) => {
        const returnObject: APIType.WebSocketType.UserSentEventReturn = JSON.parse(returnvalue);

        // Change stringifed buffer to Buffer
        const objectDocument = {
            ...returnObject,
            sender_id: Buffer.from(returnObject.sender_id.data),
        };

        const othersRes: Promise<ResSomeoneSent[]> = socket
            .to(chatRoom._id.toString())
            .timeout(500)
            .emitWithAck("someoneSent", JSON.stringify(ResMessageFactory(objectDocument, "inbound")));

        const senderRes: Promise<ResSomeoneSent> = socket.emitWithAck(
            "someoneSent",
            JSON.stringify(ResMessageFactory(objectDocument, "outgoing")),
        );

        const responses = [...(await othersRes), await senderRes];

        const respondUserIds = responses.map((res) => res.id);

        await Promise.all(
            responses.map(async (res) => {
                return chatUnreadController.updateUserUnread(res.id, chatRoom, res.lastReadSeq);
            }),
        );

        const lastReadSequences = await chatUnreadController.getUnreadSequences(chatRoom._id);

        io.in(chatRoom._id.toString()).emit("updateUnread", lastReadSequences);
        // 3. user response that I have read a message so update last read
        // If no response then don't update last read
        logger.debug(`SomeoneSent: Response: ${JSON.stringify(responses)} ${JSON.stringify(chatRoom)}`);
        logger.debug(`SomeoneSent: Return Value: ${returnvalue}`);

        await chatUnreadController.whetherSendAlarm(
            chatRoom._id,
            returnObject,
            chatRoom.participant_ids,
            respondUserIds,
        );
    });
    return;
}

async function __userTryJoinHandler(
    io: Server,
    socket: Socket,
    req: APIType.WebSocketType.ReqTryJoin,
    callback: Function,
) {
    const { chatRoomId, deviceLastSeq, id } = req;
    const chatUser: HydratedDocument<ChatTypes.ChatUserType> | undefined = socket.data.chatUser;
    const chatRoom = await chatRoomController.getChatRoomById(chatRoomId);

    if (!chatUser || !chatRoom) {
        logger.error(
            `User Try Join: No chat user or chat room: ChatUser:${JSON.stringify(chatUser)}, ChatRoom:${JSON.stringify(chatRoom)}`,
        );
        socket.disconnect(true);
        return;
    }

    logger.debug(`USer try join: ${JSON.stringify(req)}`);

    // set socket.data if user joined a room
    socket.data.chatRoom = chatRoom;

    /** Check data validity*/

    // Is he ok to join?
    const isParticipant = chatRoom.participant_ids.find((id) => id.equals(chatUser.user_id));

    if (isParticipant === undefined) {
        logger.warn(
            `Wrong user tried to enter a room. User:${JSON.stringify(chatUser)}, Room: ${JSON.stringify(chatRoom)} `,
        );
        socket.disconnect(true);
    }

    // Check ChatUser._id(==tempId) is valid
    if (id !== chatUser._id.toString()) {
        logger.error(`Wrong Chat Id: User: ${chatUser} Id: ${id}`);
        socket.disconnect(true);
        return;
    }

    /** Start try join process */

    // check unread messages and response to user
    const currChatRoomSeq = chatRoom.message_seq;
    const messages = [] as HydratedDocument<ChatTypes.ChatContentType>[];
    logger.debug(`Last read Sequece: Current: ${currChatRoomSeq}, Device: ${deviceLastSeq}`);

    if (currChatRoomSeq - deviceLastSeq > 0) {
        // get unread messages
        // get unread messages
        const unreadMessages = await chatContentController.getChatRoomMessagesBySeq(chatRoom._id, deviceLastSeq);
        messages.push(...unreadMessages);
        // update unread schema
        await chatUnreadController.updateUserUnreadByUUID(chatUser.user_id, chatRoom._id, currChatRoomSeq);
    }

    // get last read sequences to update unread count at client-side

    const lastReadSequences = await chatUnreadController.getUnreadSequences(chatRoom._id);

    const resMessages = ResMessagesFactory(messages, chatUser);

    const res = JSON.stringify({
        messages: resMessages,
        lastReadSequences: lastReadSequences,
    });

    // Response to user and await ack message
    // If there is no ack it means user failed to join a room
    try {
        callback(res);
        socket.join(chatRoomId);
        const response = await socket.timeout(500).emitWithAck("userJoined");
        // join user after acknowledgement
        logger.debug(`User joined: ChatRoomId: ${chatRoomId}, Status: ${response}`);

        // Emit users who participated in a room to update unread count
        io.in(chatRoom._id.toString()).emit("updateUnread", lastReadSequences);
        return;
    } catch (error) {
        logger.warn(`User couldn't join the room: ChatUser:${chatUser}, Error:${error}`);
        socket.disconnect(true);
        return;
    }
}

export function __initChat(io: Server) {
    io.on("connection", async (socket) => {
        const sessionUser: ISessionUser = socket.request.session?.user;
        if (sessionUser === undefined) {
            return;
        }
        // When you connected to a chat create one time chatuser identity
        // MEANS!!! that you should not use ObjectId of user
        // TODO: 기기별 1개로 재한 필요함
        // 지금은 채팅 페이지에서 유저가 요청하는데로 생성하고 있음
        let chatUser = await chatUserController.getChatUserByUUID(sessionUser.id);

        if (chatUser === null) {
            chatUser = await chatUserController.createChatUser(sessionUser.id);
        }

        if (chatUser === null) {
            return;
            throw new Error("User not created");
        }
        // then send user ObjectId to a client, so we can identify user
        try {
            logger.info(`User try connection: User: ${chatUser}`);

            const refresh = await ResRefreshFactory(chatUser);

            // Send Chatuser's ObjectId to user, and user will use this as a temporary id.
            const is_connected = await socket.timeout(500).emitWithAck("connected", {
                id: chatUser._id.toString(),
                ...refresh,
            });
        } catch (e) {
            // if no response, disconnect
            socket.disconnect(true);
            if (chatUser) {
                await chatUserController.delChatUserById(chatUser._id);
            }
            logger.warn(`User failed to connect: Error: ${e}`);
            return;
        }

        socket.data.chatUser = chatUser;
        // Register rest events
        await initSocketEvents(io, socket);
        // Register refresh chatroom event
        await __refreshChatRoomsHandler(io, socket);
        // Register update chatroom event
        await __updateChatRoomHandler(io, socket);
        return;
    });
}

async function initSocketEvents(io: Server, socket: Socket) {
    socket.on("userTryJoin", async (req, callback) => {
        await __userTryJoinHandler(io, socket, req, callback);
        await __userSentEventHandler(io, socket);
    });

    socket.on("userTryUnjoin", async (req, callback) => {
        await __userTryUnJoinHandler(io, socket, req, callback);
    });

    socket.on("updateLastRead", async (req, callback) => {
        await __updateLastReadHandler(io, socket, req, callback);
    });

    socket.on("sendMessage", async (req, callback) => {
        await __sendMessageHandler(io, socket, req, callback);
    });

    socket.on("disconnecting", async (reason: string) => {
        await __socketDisconnectHandler(io, socket, reason);
    });
    return;
}

export function __initChatTest(io: Server, user: Awaited<ReturnType<typeof UserController.getUserByName>>) {
    return new Promise((resolve) => {
        io.on("connection", async (socket) => {
            const sessionUser = user;
            let chatUser = await chatUserController.getChatUserByUUID(sessionUser.user_id);

            if (chatUser === null) {
                chatUser = await chatUserController.createChatUser(sessionUser.user_id);
            }

            if (chatUser === null) {
                return;
                throw new Error("User not created");
            }
            // then send user ObjectId to a client, so we can identify user
            try {
                // console.log(`User try connection: User: ${chatUser}`);

                const refresh = await ResRefreshFactory(chatUser);

                // Send Chatuser's ObjectId to user, and user will use this as a temporary id.
                const is_connected = await socket.timeout(5000).emitWithAck("connected", {
                    id: chatUser._id.toString(),
                    ...refresh,
                });
            } catch (e) {
                // if no response, disconnect
                socket.disconnect(true);
                await chatUserController.delChatUserById(chatUser._id);
                console.log(`User failed to connect: Error: ${e}`);
                throw new Error("error");
            }

            socket.data.chatUser = chatUser;
            // Register rest events
            await initSocketEvents(io, socket);
            // Register refresh chatroom event
            await __refreshChatRoomsHandler(io, socket);
            // Register update chatroom event
            await __updateChatRoomHandler(io, socket);

            resolve(socket);
        });
    });
}
