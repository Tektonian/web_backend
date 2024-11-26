import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { sequelize } from "./models/rdbms";
import { createServer } from "http";
import RequestRouter from "./routes/RequestRouter";
const app = express();
const PORT = process.env.PORT || 3000;
process.env.NODE_ENV = "production";
app.set("port", PORT);
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
sequelize
    .sync({ force: false })
    .then(() => {
    console.log("Database connection success");
})
    .catch((err) => {
    console.error("Database connection failed:", err);
});
app.use("/api/requests", RequestRouter);
const httpServer = createServer(app);
httpServer.listen(8080);
