import { QueueEvents } from "bullmq";
import { HydratedDocument } from "mongoose";
import { Server } from "socket.io";
import { currentSession } from "../../middleware/auth.middleware";
import { chatController } from "../../controllers/chat";
import type {
    reqTryJoinProps,
    resMessage,
    resSomeoneSent,
} from "./webSocketRouter.types";
import type {
    IChatUser,
    IChatContent,
    IChatroom,
} from "../../types/chat/chatSchema.types";
import { ISessionUser } from "../../config/auth.types";

const ResMessageRactory = (
    message: HydratedDocument<IChatContent>,
    sender: HydratedDocument<IChatUser>,
    lastReadSequences: number[],
): resMessage => {
    let ret: resMessage;
    let cnt = 0;
    for (let seq of lastReadSequences) {
        if (seq < message.seq) {
            cnt += 1;
        }
    }
    sender = sender.toJSON();
    console.log(message, sender);
    ret = {
        _id: message._id,
        seq: message.seq,
        chatRoomId: message.chatroom,
        unreadCount: cnt,
        contentType: "text",
        content: message.content,
        senderName: sender.username ?? "",
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    console.log("Processing", ret);
    return ret;
};

const ResMessagesFactory = (
    messages: HydratedDocument<IChatContent>[],
    sender: HydratedDocument<IChatUser>,
    lastReadSequences: number[],
): resMessage[] => {
    // TODO: bit wise operation later
    let ret: resMessage[] = [];
    for (let message of messages) {
        ret.push(ResMessageRactory(message, sender, lastReadSequences));
    }
    // console.log("RET: ", messages);
    return ret;
};

// See pushUpdateChatRoom function in messageQueue.ts file
async function updateChatRoomHandler(globalArgs, { jobId, returnvalue }) {
    const { socket } = globalArgs;
    const { message, chatUser } = JSON.parse(returnvalue);
    const ret = {
        _id: message._id,
        seq: message.seq,
        chatRoomId: message.chatroom,
        contentType: "text",
        content: message.content,
        senderName: chatUser.username ?? "",
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    console.log("updateHanlder: ", ret);
    socket.emit("updateChatRoom", JSON.stringify(ret));
}

async function sendMessageHandler(globalArgs, recv) {
    console.log("message: ", recv);
    const { socket, chatContentController } = globalArgs;
    const req = JSON.parse(recv);
    const chatRoom = socket.data.chatRoom;
    const chatUser = socket.data.chatUser;
    console.log("chatRoom: ", chatRoom, chatUser);

    await chatContentController.sendMessage(
        chatRoom._id,
        chatUser,
        req.message.content,
    );
}

async function updateLastReadHandler(globalArgs, recv) {
    const { socket, chatUnreadController } = globalArgs;
    const { lastSeq } = recv;
    const chatUser = socket.data.chatUser;
    const chatRoom = socket.data.chatRoom;
    chatUnreadController.updateUserUnread(chatUser._id, chatRoom, lastSeq);
}

async function userTryUnJoinHandler(globalArgs) {
    const { socket, userSentEvent } = globalArgs;
    // 4. server send last read sequences of users
    //socket.in(chatRoomId).emit("unreadSeq");

    // when user leavs chatroom
    const chatRoom = socket.data.chatRoom;
    const chatUser = socket.data.chatUser;
    if (chatRoom !== null) {
        console.log("User leave room: ", chatRoom);
        socket.leave(chatRoom._id);
    }
    socket.data.chatRoom = null;
}

async function socketDisconnectHandler(globalArgs, reason) {
    const { socket, userSentEvent, updateChatRoomEvent, chatUserController } =
        globalArgs;
    const chatUser = socket.data.chatUser;
    console.log(
        "User disconnected: ",
        socket.data.chatUser,
        " reason ",
        reason,
    );

    await chatUserController.delUserById(chatUser._id);
}

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
    console.log("User Sent", jobId, returnvalue);
    const responses: resSomeoneSent[] = await io
        .in(chatRoom._id.toString())
        .timeout(500)
        .emitWithAck(
            "someoneSent",
            JSON.stringify(
                ResMessageRactory(JSON.parse(returnvalue), chatUser, [0]),
            ),
        );
    const respondUserIds = responses.map((res) => res.id);
    chatUnreadController.whetherSendAlarm(
        chatRoom,
        JSON.parse(returnvalue),
        participant_ids,
        respondUserIds,
    );
    // 3. user response that I have read a message so update last read
    // If no response then don't update last read
    console.log("SomeoneSent responses: ", socket.id, responses);
    console.log("SomeoneSent returnvale: ", jobId, " ", returnvalue);
}

async function userTryJoinHandler(globalArgs, req: reqTryJoinProps) {
    const {
        socket,
        chatRoomController,
        chatUser,
        chatContentController,
        chatUnreadController,
    } = globalArgs;
    // Is he ok to join?
    const { chatRoomId, deviceLastSeq } = req;
    const chatRoom: IChatroom | null =
        await chatRoomController.getChatRoomById(chatRoomId);
    console.log("messages", req);

    // set socket.data if user joined a room
    socket.data.chatRoom = chatRoom;
    socket.data.chatUser = chatUser;
    console.log("Socket chatroom", socket.data.chatRoom);
    if (chatRoom === null) {
        return;
        throw new Error(`Room not exist: ${chatRoomId}`);
    }
    if (!chatRoom.participant_ids.includes(chatUser.user_id)) {
        throw new Error("User have no perssion to access a room");
    }

    // received unread messages and update unread schema
    const currChatRoomSeq = chatRoom.message_seq;
    const messages = [] as IChatContent[];
    console.log("SEqs: ", currChatRoomSeq, deviceLastSeq);
    if (currChatRoomSeq - deviceLastSeq > 0) {
        // get unread messages
        const unreadMessages =
            await chatContentController.getChatRoomMessagesBySeq(
                chatRoom,
                deviceLastSeq,
            );
        messages.push(...unreadMessages);
        // update unread schema
        await chatUnreadController.updateUserUnread(
            chatUser,
            chatRoom,
            currChatRoomSeq,
        );
        // console.log("Unread, ", unreadMessages);
    }
    // get last read sequences
    const lastReadSeqences = await chatUnreadController.getUnreadSequences(
        chatRoom._id,
    );

    const resMessages = ResMessagesFactory(
        messages,
        chatUser,
        lastReadSeqences as number[],
    );

    const res = JSON.stringify({
        messages: resMessages,
        lastReadSequences: lastReadSeqences,
    });

    try {
        const response = await socket
            .timeout(500)
            .emitWithAck("userJoined", res);
        // join user after acknowledgement
        console.log("User joined: ", chatRoomId, " status: ", response);
        socket.join(chatRoomId);
    } catch (e) {
        // should now reach here
        throw new Error("User couldn't join the room");
    }
}

const eventRegistHelper = async (eventFlow) => {
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
                await target.on(eventName, async (...args) => {
                    await chain.handler.call(target, globalArgs, ...args);
                    await eventRegistHelper(nextEventFlow);
                });
            }
        }
        // If end
    }
    // For end
};

export default function initChat(httpServer) {
    const {
        chatContentController,
        chatRoomController,
        chatUserController,
        chatUnreadController,
    } = chatController;

    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:3000",
            credentials: true,
        },
        path: "/api/chat",
    });

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
        const chatUser: IChatUser = await chatUserController.createUser({
            user_id: sessionUser.id,
            email: sessionUser.email,
            username: sessionUser.name,
            image: "",
        });

        if (chatUser === null) {
            return;
            throw new Error("User not created");
        }

        // then send user ObjectId to a client, so we can identify user
        try {
            const is_connected = await socket
                .timeout(500)
                .emitWithAck("connected", { id: chatUser._id });
            console.log("User connected: ", is_connected);
        } catch (e) {
            // if no response, disconnect
            socket.disconnect(true);
            await chatUserController.delUserById(chatUser._id);
            console.log("User failed to connect", e);
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
        const eventRegisterFlow = {
            globalArgs: {
                io,
                socket,
                userSentEvent,
                updateChatRoomEvent,
                chatUserController,
                chatRoomController,
                chatUnreadController,
                chatContentController,
                chatUser,
            },
            eventTargets: {
                socket,
                userSentEvent,
                updateChatRoomEvent,
            },
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
                                `${socket.data.chatRoom._id.toString()}:${socket.data.chatUser._id.toString()}`,
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
                },
                {
                    eventTarget: "socket",
                    eventName: "updateLastRead",
                    handler: updateLastReadHandler,
                },
                {
                    eventTarget: "socket",
                    eventName: "sendMessage",
                    handler: sendMessageHandler,
                },
                {
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
