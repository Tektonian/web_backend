import { models } from "./models/rdbms";
import { chatController } from "./controllers/chat";
import { ChatUser } from "./models/chat";
import { Request } from "./models/rdbms/Request";
import logger from "./utils/logger";
export const chatTest = async () => {
    const userModel = models.User;
    const { chatRoomController, chatContentController, chatUserController } =
        chatController;

    const users = await userModel.findAll({
        attributes: ["user_id", "username", "email"],
    });
    await Promise.all(
        users.map(async (user) => {
            return chatUserController.createChatUser(user.dataValues);
        }),
    );

    const dataValues = users.map((val) => val.get({ plain: true }));

    const test0 = dataValues.filter((val) => val.email === "test0@test.com")[0];
    const test1 = dataValues.filter((val) => val.email === "test1@test.com")[0];
    const student1 = dataValues.filter(
        (val) => val.email === "student1@test.com",
    )[0];
    const student2 = dataValues.filter(
        (val) => val.email === "student2@test.com",
    )[0];

    const chatUsers = await chatUserController.getUsers(dataValues);
    const requests = await Request.findAll({ raw: true });
    await Promise.all(
        requests.map(async (req) => {
            return await Request.update(
                { student_ids: [] },
                { where: { request_id: req.request_id } },
            );
        }),
    );
    const requestId = requests[0].request_id;
    await chatRoomController.createChatRoom(requestId, test0.user_id, [
        test0.user_id,
        test1.user_id,
    ]);
    await chatRoomController.createChatRoom(requestId, test0.user_id, [
        test0.user_id,
        student1.user_id,
    ]);
    await chatRoomController.createChatRoom(requestId, test0.user_id, [
        test0.user_id,
        student2.user_id,
    ]);

    const chatRooms = await chatRoomController.getChatRoomsByRequestId(1);

    const chatRoom = chatRooms[0];

    const test0Chat = await chatUserController.getUserByEmail("test0@test.com");
    const test1Chat = await chatUserController.getUserByEmail("test1@test.com");

    for (var i = 0; i < 30; i++) {
        await chatContentController.sendMessage(
            chatRoom,
            i % 2 === 0 ? test0Chat : test1Chat,
            `Ah yeah${i}`,
        );
    }

    chatUserController.delChatUserById(test0Chat._id);
    chatUserController.delChatUserById(test1Chat._id);

    const getChatRoomMessages = await chatContentController.getChatRoomMessages(
        chatRoom._id,
    );
    const lastSeqMessage = await chatContentController.getChatRoomMessagesBySeq(
        chatRoom._id,
        10,
    );

    await chatUserController.delChatUserById(test0Chat._id);
    await chatUserController.delChatUserById(test1Chat._id);

    await ChatUser.deleteMany();
};
