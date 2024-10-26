import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import requestInfoRoutes from "./routes/requestInfoRoutes";
import requestInfoSequelize from "./dbconfig/requestInfoDatabase";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/request-info", requestInfoRoutes);

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
