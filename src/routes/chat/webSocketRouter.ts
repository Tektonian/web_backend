import { createHash } from "crypto";
import { QueueEvents } from "bullmq";
import { HydratedDocument, InferRawDocType, InferSchemaType } from "mongoose";
import { Server } from "socket.io";

import { currentSession } from "../../middleware/auth.middleware";

import { chatController } from "../../controllers/chat";
import * as UserController from "../../controllers/UserController";

import { ChatContent, ChatUser, Types as ChatTypes } from "../../models/chat";

import { APIType } from "api_spec";
import { ISessionUser } from "../../config/auth.types";

import logger from "../../utils/logger";

type ReqSendMessage = APIType.WebSocketType.ReqSendMessage;
type ResSomeoneSent = APIType.WebSocketType.ResSomeoneSent;

type ReqUpdateLastRead = APIType.WebSocketType.ReqUpdateLastRead;

type ResChatRoom = APIType.ChatRoomType.ResChatRoom;

type UserSentEventReturn = APIType.WebSocketType.UserSentEventReturn;
type UpdateChatRoomReturn = APIType.WebSocketType.UpdateChatRoomReturn;

const ResChatRoomFactory = async (
    chatRoom: ChatTypes.ChatRoomType,
): Promise<ResChatRoom> => {
    const consumer = (
        await UserController.getUserById(Buffer.from(chatRoom.consumer_id))
    )?.get({ plain: true });

    const usersUUIDs = chatRoom.participant_ids.map((id) => Buffer.from(id));
    const participantsInst = await UserController.getUsersById(usersUUIDs);

    const participants = participantsInst.map((inst) =>
        inst.get({ plain: true }),
    );
    const lastMessage =
        await chatController.chatContentController.getChatRoomLastMessage(
            chatRoom._id,
        );

    logger.debug(
        `ResChatRoomFactory: ${JSON.stringify(chatRoom)} ${JSON.stringify(lastMessage)}`,
    );
    const participantsRes = participants.map((part) => {
        return {
            // IMPORTANT
            // _id: "" <- user's chat id should not respond
            user_name: part.username ?? "",
            user_id: createHash("sha256")
                .update(part.user_id.toString("hex"))
                .digest("hex"),
            email: part.email,
            image_url: part.image ?? "",
        };
    });
    const consumerName = consumer?.username;
    const participantNames = new Set(participants.map((part) => part.username));
    const resChatroom: ResChatRoom = {
        title: chatRoom.title,
        chatRoomId: chatRoom._id.toString(),
        messageSeq: chatRoom.message_seq,
        lastSenderId: createHash("sha256")
            .update(lastMessage.sender_id.toString("hex"))
            .digest("hex"),
        consumer: consumer,
        participants: participantsRes,
        lastMessage: lastMessage?.content,
        lastSentTime: lastMessage?.created_at,
    };
    return resChatroom;
};

const ResMessageFactory = (
    message: HydratedDocument<IChatContent>,
    direction: "outgoing" | "inbound",
): resMessage => {
    let ret: resMessage;

    let hashedSenderId: string | undefined = "";
    if (message.toJSON().sender_id === undefined) {
        hashedSenderId = undefined;
    } else {
        const sender_id = message.toJSON().sender_id;
        hashedSenderId = createHash("sha256")
            .update(Buffer.from(sender_id).toString("hex"))
            .digest("hex");
    }

    ret = {
        _id: message._id,
        seq: message.seq,
        chatRoomId: message.chatroom._id.toString(),
        contentType: "text",
        content: message.content,
        senderId: hashedSenderId,
        direction: direction,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    logger.debug(`Processing Message: ${message} ${ret}`);
    return ret;
};

const ResMessagesFactory = (
    messages: HydratedDocument<IChatContent>[],
    chatUser: HydratedDocument<IChatUser>,
): resMessage[] => {
    // TODO: bit wise operation later
    let ret: resMessage[] = [];
    for (let message of messages) {
        let dir: "inbound" | "outgoing" = "inbound";
        // Room message
        if (message.sender_id === undefined) {
            dir = "inbound";
        } else {
            dir =
                message.sender_id.toString("hex") ===
                chatUser.user_id.toString("hex")
                    ? "outgoing"
                    : "inbound";
        }
        ret.push(ResMessageFactory(message, dir));
    }
    return ret;
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
async function updateChatRoomHandler(globalArgs, { jobId, returnvalue }) {
    console.log(returnvalue);
    logger.debug(`updateChatRoomHandler: ${returnvalue}`);
    const { socket } = globalArgs;
    const { message }: { message: APIType.WebSocketType.UserSentEventReturn } =
        JSON.parse(returnvalue);

    const ret: APIType.WebSocketType.ResUpdateChatRoom = {
        _id: message._id,
        seq: message.seq,
        chatRoomId: message.chatroom,
        contentType: message.content_type,
        content: message.content,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    logger.debug(`Update Room handler: ${ret}`);
    socket.emit("updateChatRoom", JSON.stringify(ret));
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
async function sendMessageHandler(globalArgs, recv: ReqSendMessage) {
    logger.debug(`Send message Handler: Received: ${JSON.stringify(recv)}`);
    const { socket, chatContentController } = globalArgs;
    const chatRoom = socket.data.chatRoom;
    const chatUser = socket.data.chatUser;
    logger.debug(
        `Send message Handler: chatRoom: ${chatRoom}, chatUser: ${chatUser}, Message: ${JSON.stringify(recv)}`,
    );
    if (!chatRoom || !chatUser) {
        socket.disconnect();
        return;
    }
    // Check sender's temporary id is same as chatUser id
    if (recv.senderId !== chatUser._id.toString()) {
        // TODO: add throw error
        return;
    }

    await chatContentController.sendMessage(
        chatRoom._id,
        chatUser._id,
        recv.message,
    );
}

async function updateLastReadHandler(globalArgs, recv: ReqUpdateLastRead) {
    const { socket, chatUnreadController } = globalArgs;
    const { lastSeq } = recv;
    const chatUser = socket.data.chatUser;
    const chatRoom = socket.data.chatRoom;
    chatUnreadController.updateUserUnreadByUUID(
        chatUser.user_id,
        chatRoom,
        lastSeq,
    );
}

async function userTryUnJoinHandler(globalArgs) {
    const { socket, userSentEvent } = globalArgs;
    // 4. server send last read sequences of users
    //socket.in(chatRoomId).emit("unreadSeq");

    // when user leavs chatroom
    const chatRoom = socket.data.chatRoom;
    const chatUser = socket.data.chatUser;
    if (chatRoom !== null) {
        logger.debug(
            `User leave room: User: ${chatUser}, ChatRoom: ${chatRoom}`,
        );
        userSentEvent.off(
            `${socket.data.chatUser._id.toString()}:${socket.data.chatRoom._id.toString()}`,
            userSentEventHandler,
        );
        socket.leave(chatRoom._id);
    }
}

async function socketDisconnectHandler(globalArgs, reason) {
    const { socket, userSentEvent, updateChatRoomEvent, chatUserController } =
        globalArgs;
    const chatUser = socket.data.chatUser;
    logger.debug(
        `User disconnected: User: ${socket.data.chatUser} Reason: ${reason}`,
    );

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
async function userSentEventHandler(
    globalArgs,
    {
        jobId,
        returnvalue, // JSON.stringfied IChatContent
    },
) {
    const { io, socket, chatUnreadController } = globalArgs;
    const chatRoom = socket.data.chatRoom;
    const chatUser = socket.data.chatUser;
    const participant_ids = chatRoom.participant_ids;
    // 2. emit user "otherSent"
    // and server waits for users' "updateLastRead"
    const returnObject = JSON.parse(returnvalue);
    const objectDocument = new ChatContent({
        ...returnObject,
        sender_id: Buffer.from(returnObject.sender_id.data),
    });

    const othersRes: Promise<ResSomeoneSent[]> = socket
        .to(chatRoom._id.toString())
        .timeout(500)
        .emitWithAck(
            "someoneSent",
            JSON.stringify(ResMessageFactory(objectDocument, "inbound")),
        );

    const senderRes: Promise<ResSomeoneSent> = socket.emitWithAck(
        "someoneSent",
        JSON.stringify(ResMessageFactory(objectDocument, "outgoing")),
    );

    const responses = [...(await othersRes), await senderRes];

    const respondUserIds = responses.map((res) => res.id);

    await Promise.all(
        responses.map(async (res) => {
            return chatUnreadController.updateUserUnread(
                res.id,
                chatRoom,
                res.lastReadSeq,
            );
        }),
    );

    const lastReadSequences =
        await chatUnreadController.getUnreadSequences(chatRoom);

    io.in(chatRoom._id.toString()).emit("updateUnread", lastReadSequences);
    // 3. user response that I have read a message so update last read
    // If no response then don't update last read
    logger.debug(
        `SomeoneSent: Response: ${JSON.stringify(responses)} ${JSON.stringify(chatRoom)}`,
    );
    logger.debug(`SomeoneSent: Return Value: ${returnvalue}`);

    await chatUnreadController.whetherSendAlarm(
        chatRoom,
        JSON.parse(returnvalue),
        participant_ids,
        respondUserIds,
    );
}

async function userTryJoinHandler(
    globalArgs,
    req: APIType.WebSocketType.ReqTryJoin,
) {
    const {
        io,
        socket,
        chatRoomController,
        chatUser,
        chatContentController,
        chatUnreadController,
    } = globalArgs;
    const { chatRoomId, deviceLastSeq, id } = req;
    const chatRoom: HydratedDocument<ChatTypes.ChatRoomType> | null =
        await chatRoomController.getChatRoomById(chatRoomId);
    logger.debug(`User Try join: ${JSON.stringify(req)}`);

    // set socket.data if user joined a room
    socket.data.chatRoom = chatRoom;
    socket.data.chatUser = chatUser;

    if (chatRoom === null) {
        logger.error(`Room not exist: ${chatRoomId}`);
        return;
    }
    // Is he ok to join?
    const isParticipant = chatRoom.participant_ids.find((id) =>
        id.equals(chatUser.user_id),
    );
    if (isParticipant === undefined) {
        logger.error(`User have no perssion to access a room `);
        return;
    }
    // Check users temporary id
    if (id !== chatUser._id.toString()) {
        logger.error(`Wrong Chat Id: User: ${chatUser} Id: ${id}`);
        console.log(JSON.stringify(req));
        console.log(req);
        return;
    }

    // received unread messages and update unread schema
    const currChatRoomSeq = chatRoom.message_seq;
    const messages = [] as HydratedDocument<IChatContent>[];
    logger.debug(
        `Last read Sequece: Current: ${currChatRoomSeq}, Device: ${deviceLastSeq}`,
    );
    if (currChatRoomSeq - deviceLastSeq > 0) {
        // get unread messages
        const unreadMessages =
            await chatContentController.getChatRoomMessagesBySeq(
                chatRoom,
                deviceLastSeq,
            );
        messages.push(...unreadMessages);
        // update unread schema
        await chatUnreadController.updateUserUnreadByUUID(
            chatUser.user_id,
            chatRoom._id,
            currChatRoomSeq,
        );
    }
    // get last read sequences
    const lastReadSequences = await chatUnreadController.getUnreadSequences(
        chatRoom._id,
    );

    const resMessages = ResMessagesFactory(messages, chatUser);

    const res = JSON.stringify({
        messages: resMessages,
        lastReadSequences: lastReadSequences,
    });

    try {
        const response = await socket
            .timeout(500)
            .emitWithAck("userJoined", res);
        // join user after acknowledgement
        logger.debug(
            `User joined: ChatRoomId: ${chatRoomId}, Status: ${response}`,
        );
        socket.join(chatRoomId);
        io.in(chatRoom._id.toString()).emit("updateUnread", lastReadSequences);
    } catch (e) {
        // should now reach here
        throw new Error("User couldn't join the room");
    }
}

type Objects = Record<keyof Object, Object>;

type EventHandler<Args extends Objects> = (
    globalArgs: Args,
    ...args: any[]
) => void;

interface Ring<Args extends Objects, Target extends Objects> {
    description: string;
    eventTarget: keyof Target;
    eventName: string | (() => string);
    handler: EventHandler<Args>;
}
interface Chain<Args extends Objects, Target extends Objects>
    extends Ring<Args, Target> {
    chains: Ring<Args, Target>[];
}

interface EventFlow<Args extends Objects, Target extends Objects> {
    globalArgs: Args;
    eventTargets: Target;
    chains: Chain<Args, Target>[] | Ring<Args, Target>[];
}

async function eventRegistHelper<A extends Objects, T extends Objects>(
    eventFlow: EventFlow<A, T>,
) {
    // list ([a]) to object {a: 'a'}
    const globalArgs = eventFlow.globalArgs;
    const eventTargets = eventFlow.eventTargets;
    const chains = eventFlow.chains;
    for (let chain of chains) {
        const target = eventTargets[chain.eventTarget];

        // Check lazy evaluation
        const eventName =
            typeof chain.eventName === "function"
                ? chain.eventName()
                : chain.eventName;

        const action = chain.action;

        const nextChains: undefined | any[] = chain.chains;
        const nextEventFlow = {
            globalArgs: globalArgs,
            eventTargets: eventTargets,
            chains: nextChains,
        };

        // Disconnect
        if (action === "disconnect") {
            await target.disconnect();

            // Check recursive
            if (nextChains !== undefined) {
                await eventRegistHelper(nextEventFlow);
            }
        }
        // Unregist events
        else if (chain.handler === undefined || action === "off") {
            await target.off(eventName);
            // Check recursive
            if (nextChains !== undefined) {
                await eventRegistHelper(nextEventFlow);
            }
        }
        // Regist events
        else {
            // Check recursive
            if (nextChains === undefined) {
                await target.on(
                    eventName,
                    chain.handler.bind(target, globalArgs),
                );
            } else {
                await target.on(eventName, async (...args: any[]) => {
                    await chain.handler.call(target, globalArgs, ...args);
                    await eventRegistHelper(nextEventFlow);
                });
            }
        }
        // If end
    }
    // For end
}

export default function initChat(httpServer) {
    const {
        chatContentController,
        chatRoomController,
        chatUserController,
        chatUnreadController,
    } = chatController;

    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            credentials: true,
        },
        path: "/api/chat",
    });

    logger.info("Initialized Socket io");

    // set user and chatroom datas on socket instance
    io.use((socket, next) => {
        // chatRoom will be set 'join' event
        socket.data.chatRoom = null;
        // TODO: should add protocol to get session -> change later
        socket.request.protocol = "ws";
        currentSession(socket.request, socket.request, next);
    });

    io.on("connection", async (socket) => {
        const userSentEvent = new QueueEvents("userSentMessage");
        const updateChatRoomEvent = new QueueEvents("updateChatRoom");
        const sessionUser: ISessionUser = socket.request.session?.user;
        if (sessionUser === undefined) {
            return;
        }
        // When you connected to a chat create one time chatuser identity
        // MEANS!!! that you should not use ObjectId of user
        // TODO: 기기별 1개로 재한 필요함
        // 지금은 채팅 페이지에서 유저가 요청하는데로 생성하고 있음
        let chatUser: HydratedDocument<ChatTypes.ChatUserType> | null =
            await chatUserController.getChatUserByUUID(sessionUser.id);

        if (chatUser === null) {
            chatUser = await chatUserController.createChatUser(sessionUser.id);
        }

        if (chatUser === null) {
            return;
            throw new Error("User not created");
        }

        // then send user ObjectId to a client, so we can identify user
        try {
            const chatRooms = await chatRoomController.getAliveChatRoomsByUser(
                chatUser.user_id,
            );

            const resChatRooms = await Promise.all(
                chatRooms.map(async (chatRoom) => ResChatRoomFactory(chatRoom)),
            );
            const is_connected = await socket
                .timeout(500)
                .emitWithAck("connected", {
                    id: chatUser._id.toString(),
                    chatRooms: resChatRooms,
                });
            logger.info(
                `User try connection: User: ${chatUser}, Result: ${is_connected}`,
            );
        } catch (e) {
            // if no response, disconnect
            socket.disconnect(true);
            await chatUserController.delChatUserById(chatUser._id);
            logger.warn(`User failed to connect: Error: ${e}`);
            return;
        }
        socket.data.chatUser = chatUser;

        /**
         * There could be three types of events. "on" | "off" | "disconnect"
         * All connections are already made so there is no "connect" event
         *
         * Types of three events are as follows
         *
         * "on": handler: Function, action: undefined | "on"
         * "off": handler: undefined, action: undefined | "off"
         * "disconnect": handler: undefined, action: "disconnect"
         *
         * TODO: add error handler later
         */
        const globalArgs = {
            io,
            socket,
            userSentEvent,
            updateChatRoomEvent,
            chatUserController,
            chatRoomController,
            chatUnreadController,
            chatContentController,
            chatUser,
        };
        const eventTargets = {
            socket,
            userSentEvent,
            updateChatRoomEvent,
        };

        const eventRegisterFlow: EventFlow<
            typeof globalArgs,
            typeof eventTargets
        > = {
            globalArgs,
            eventTargets,
            chains: [
                {
                    description: "Events when user try joined",
                    eventTarget: "socket",
                    eventName: "userTryJoin",
                    handler: userTryJoinHandler,
                    chains: [
                        {
                            description:
                                "After user joined a chatroom, the `socket.data.chatRoom` should be set so we will evaluate eventName later",
                            eventTarget: "userSentEvent",
                            eventName: () =>
                                `${socket.data.chatUser._id.toString()}:${socket.data.chatRoom._id.toString()}`,
                            handler: userSentEventHandler,
                        },
                    ],
                },
                {
                    description:
                        "When user leave a chatroom, make user leave a socket room and remove eventlistenr",
                    eventTarget: "socket",
                    eventName: "userTryUnjoin",
                    handler: userTryUnJoinHandler,
                    /*
                    Wrong code
                    chains: [
                        {
                            description:
                                "remove eventlistener of userSentEvent",
                            eventTarget: "userSentEvent",
                            action: "off",
                            eventName: () =>
                                `${socket.data.chatUser._id.toString()}:${socket.data.chatRoom._id.toString()}`,
                        },
                    ],
                    */
                },
                {
                    description: "",
                    eventTarget: "socket",
                    eventName: "updateLastRead",
                    handler: updateLastReadHandler,
                },
                {
                    description: "",
                    eventTarget: "socket",
                    eventName: "sendMessage",
                    handler: sendMessageHandler,
                },
                {
                    description: "",
                    eventTarget: "updateChatRoomEvent",
                    eventName: () => socket.data.chatUser._id.toString(),
                    handler: updateChatRoomHandler,
                },
                {
                    eventTarget: "socket",
                    eventName: "disconnecting",
                    handler: socketDisconnectHandler,
                    chains: [
                        {
                            eventTarget: "userSentEvent",
                            action: "disconnect",
                        },
                        {
                            eventTarget: "updateChatRoomEvent",
                            action: "disconnect",
                        },
                    ],
                },
            ],
        };

        eventRegistHelper(eventRegisterFlow);
    });

    return io;
}
