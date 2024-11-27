/**
 * Router regarding chattings.
 * such as, unread message count and information about current chatrooms
 */
import { Router } from "express";
import { getUnreadCountOfUser } from "../../controllers/chat/chatUnreadController";
const ChatRouter = Router();

ChatRouter.post("/unread", async (req, res) => {
    const sessionUser = res.session.user;
    if (sessionUser === undefined) res.json("No session");

    const ret = await getUnreadCountOfUser(sessionUser.id);

    res.json({ unreadCount: ret });
});

ChatRouter.post("/chatRooms", async (req, res, next) => {
    const sessionUser = res.session.user;
    if (sessionUser === undefined) res.json("No session");
    const dbUserData = await models.User.findOne({
        where: { email: sessionUser.email },
        attributes: ["user_id", "username", "email"],
    });
    const chatRooms =
        await chatController.chatRoomController.getAllChatRoomsByUser(
            dbUserData?.dataValues,
        );

    const ResChatRoomFactory = async (chatRoom: IChatroom): ResChatRoom => {
        const consumer = await chatController.chatUserController.getUserByUUID(
            chatRoom.consumer_id,
        );
        const participants =
            await chatController.chatUserController.getUsersByUUID(
                chatRoom.participant_ids,
            );
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

export default ChatRouter;
