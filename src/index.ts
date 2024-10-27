import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import requestInfoRoutes from "./routes/requestInfoRoutes";
import studentProfileRoutes from "./routes/studentProfileRoutes";
import corpProfileRoutes from "./routes/corpProfileRoutes";
import requestInfoSequelize from "./dbconfig/requestInfoDatabase";
import studentProfileSequelize from "./dbconfig/studentProfileDatabase";
import corpProfileSequelize from "./dbconfig/corpProfileDatabase";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/request-info", requestInfoRoutes);
app.use("/student-profile", studentProfileRoutes);
app.use("/corp-profile", corpProfileRoutes);

Promise.all([
    requestInfoSequelize.sync(),
    studentProfileSequelize.sync(),
    corpProfileSequelize.sync(),
])
    .then(() => {
        console.log("All databases & tables synced successfully!");
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to sync one or more databases:", error);
    });
