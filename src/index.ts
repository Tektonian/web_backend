import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { models, sequelize } from "./models/rdbms";
import { createServer } from "http";
import RequestRouter from "./routes/RequestRouter";
import StudentRouter from "./routes/StudentRouter";
import SchoolRouter from "./routes/SchoolRouter";
import ConsumerRouter from "./routes/ConsumerRouter";
import StudentReviewRouter from "./routes/StudentReviewRouter";
import AcademicHistoryRouter from "./routes/AcademicHistoryRouter";
import ExamHistoryRouter from "./routes/LanguageHistory";
import CorporationRouter from "./routes/CorporationRouter";
import CorporationReviewRouter from "./routes/CorporationReviewRouter";

const app = express();
const PORT = process.env.PORT || 8080;
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
app.use("/api/students", StudentRouter);
app.use("/api/schools", SchoolRouter);
app.use("/api/consumers", ConsumerRouter);
app.use("/api/student-reviews", StudentReviewRouter);
app.use("/api/academic-histories", AcademicHistoryRouter);
app.use("/api/exam-histories", ExamHistoryRouter);
app.use("/api/corporations", CorporationRouter);
app.use("/api/corporation-reviews", CorporationReviewRouter);

const httpServer = createServer(app);
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
