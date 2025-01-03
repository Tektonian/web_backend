import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { Server as SocketServer, type Socket as ServerSocketType } from "socket.io";
import { io as ioClient, type Socket as ClientSocketType } from "socket.io-client";
import { createServer } from "http";
import { User } from "../../models/rdbms/User";
import { Request } from "../../models/rdbms/Request";
import { __initChatTest } from "../../routes/chat/webSocketRouter";
import * as UserController from "../../controllers/UserController";
import * as ChatUserController from "../../controllers/chat/chatUserController";
import * as ChatContentController from "../../controllers/chat/chatContentController";
import * as ChatRoomController from "../../controllers/chat/chatRoomController";
import { generateChatDummyData, cleanChatData } from "../../dummyChatData";
import type { UserAttributes } from "../../models/rdbms/User";

let io: SocketServer;
let serverSocket: ServerSocketType;
let clientSocket: ClientSocketType;
let user: UserAttributes;

beforeAll(async () => {
    await generateChatDummyData();

    // TODO: User should contain not finished request
    user = await User.findOne({ where: { email: "corp3@test.com" }, raw: true });

    return await new Promise((resolve) => {
        const httpServer = createServer();
        io = new SocketServer(httpServer);
        httpServer.listen(process.env.PORT, async () => {
            clientSocket = ioClient("http://localhost:8080", { autoConnect: false });
            clientSocket.on("connect_error", (error) => {
                console.error(error);
            });

            __initChatTest(io, user).then((val) => {
                serverSocket = val;
            });
            resolve(0);
        });
    });
});

afterAll(() => {
    //clientSocket.disconnect();
    //io.close();
    cleanChatData();
});

describe("채팅 Connection 테스트", () => {
    it("Connected 이벤트 성공 할 경우 - Chatuser의 ObjectId & Alive chatroom length check", async () => {
        let ResCopy: any = 0;
        await new Promise((resolve) => {
            clientSocket.on("connected", (res, callback) => {
                callback({ status: "ok" });
                ResCopy = res;
                resolve(0);
            });
            clientSocket.connect();
        });

        const chatUser = await ChatUserController.getChatUserByUUID(user.user_id);
        const chatRooms = await ChatRoomController.getAliveChatRoomsByUser(user.user_id);
        await new Promise((resolve) => {
            expect(ResCopy.id).toEqual(chatUser?._id.toString());
            expect(ResCopy.chatRooms.length).toEqual(chatRooms.length);
            clientSocket.removeAllListeners("connected");
            clientSocket.disconnect();
            resolve(0);
        });
    });

    it("Server socket 초기화 확인", () => {
        expect(serverSocket === undefined).toBeFalsy();
    });

    it("등록된 이벤트 목록 확인 (정상적으로 초기화 되었는지 확인)", () => {
        const eventNameSet = new Set(serverSocket.eventNames());
        const expectEventNames = new Set([
            "userTryJoin",
            "userTryUnjoin",
            "updateLastRead",
            "sendMessage",
            "disconnecting",
        ]);
        expect(eventNameSet.isSupersetOf(expectEventNames)).toBeTruthy();
    });
});

describe("User Try Join 이벤트 테스트", () => {
    it("Create Connection First", async () => {
        let ResCopy: any = 0;
        await new Promise((resolve) => {
            clientSocket.on("connected", (res, callback) => {
                callback({ status: "ok" });
                ResCopy = res;
                resolve(0);
            });
            clientSocket.connect();
        });
        const chatUser = await ChatUserController.getChatUserByUUID(user.user_id);
        await new Promise((resolve) => {
            expect(ResCopy.id).toEqual(chatUser?._id.toString());
            resolve(0);
        });
    });

    it("UserTryJoin 이벤트 성공 할 경우", async () => {
        const chatUser = await ChatUserController.getChatUserByUUID(user.user_id);
        const chatRooms = await ChatRoomController.getAliveChatRoomsByUser(user.user_id);

        clientSocket.once("userJoined", (callback) => {
            console.log("User joined");
            callback({ status: "ok" });
        });

        const request = {
            id: chatUser?._id.toString(),
            chatRoomId: chatRooms.at(0)?._id.toString(),
            deviceLastSeq: 0,
        };
        const response = await clientSocket.timeout(500).emitWithAck("userTryJoin", request);
        const chatContents = await ChatContentController.getChatRoomMessages(chatRooms.at(0)?._id);

        await new Promise((resolve) => {
            const { messages, lastReadSequences } = JSON.parse(response);
            expect(messages[0]._id).toEqual(chatContents[0]._id.toString());
            resolve(0);
        });
    });

    it("User try join 후 socket namespace상의 socket 확인", async () => {
        const chatRooms = await ChatRoomController.getAliveChatRoomsByUser(user.user_id);

        const socketsInNamespace = await io.in(chatRooms.at(0)?._id.toString()).fetchSockets();
        console.log("Rooms", serverSocket.id);
        console.log("Rooms", serverSocket.eventNames());
        expect(socketsInNamespace.map((sock) => sock.id).includes(clientSocket.id)).toBeTruthy();
    });
});
