import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import requestInfoRoutes from "./routes/requestInfoRoutes.js";
//import requestInfoSequelize from "./dbconfig/requestInfoDatabase";
import { chatTest } from "./dbconfig/chatDatabase.js";
import { authConfig } from "./config/auth.config.js";
import { ExpressAuth } from "@auth/express";
import {
    currentSession,
    authenticateUser,
} from "./middleware/auth.middleware.js";
import { models } from "./models/index.js";
import initChat from "./routes/chatRouter.js";
import { createServer } from "http";

const app = express();
const PORT = process.env.PORT || 8080;
process.env.NODE_ENV = "production";
app.set("port", 3000);

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/request-info", requestInfoRoutes);

app.use("/api/auth/*", ExpressAuth(authConfig));

/*
requestInfoSequelize
    .sync()
    .then(() => {
        console.log("RequestInfo database & tables synced successfully!");
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to sync database:", error);
    });
*/
app.use(currentSession);

// Routes
app.get("/protected", async ({ req, res, next }: netProps) => {
    res.json({ session: res.session });
});

app.get(
    "/api/protected",
    authenticateUser,
    async ({ req, res, next }: netProps) => {
        res.json(res.session);
    },
);

app.get("/", async ({ req, res, next }: netProps) => {
    res.json({
        title: "Express Auth Example",
        user: res.session?.user,
    });
});
/*
app.post("/chatRooms", async (req, res, next) => {
    const sessionUser = res.session.user;
    if (sessionUser === undefined) res.json("No session");
    const dbUserData = await models.User.findOne({
        where: { email: sessionUser.email },
        attributes: ["user_id", "username", "email"],
    });
    const chatRooms = await chatControl.getChatRoomsByUser(
        dbUserData?.dataValues,
    );
    res.json(chatRooms);
});

app.post("/chatContents", async (req, res, next) => {
    const { chatroom_id } = req.body;
    const sessionUser = res.session.user;
    if (sessionUser === undefined) res.json("No session");
    const dbUserData = await models.User.findOne({
        where: { email: sessionUser.email },
        attributes: ["user_id", "username", "email"],
    });
    const messages = await chatControl.getChatRoomMessagesBiz(
        chatroom_id,
        dbUserData?.dataValues,
    );
    console.log(messages);
    res.json(messages);
});
*/
chatTest();

const httpServer = createServer(app);

//const io = initChat(httpServer);
httpServer.listen(8080);
//app.listen(8080, () => console.log("App listening"));
