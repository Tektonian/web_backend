import express, { Request, Response } from "express";
import { Request as RequestModel } from "../models/rdbms/Request";
import {
    createRequestBody,
    getRequestByRequestId,
} from "../controllers/RequestController";

const RequestRouter = express.Router();

RequestRouter.post("/", async (req: Request, res: Response) => {
    const ret = await createRequestBody(req.body);
    if (ret === null) {
        res.status(500).json({ message: "Internal Server Error" });
    } else {
        res.status(201).json({
            message: "Request Body created successfully",
            request: ret,
        });
    }
});

RequestRouter.get("/:request_id", async (req: Request, res: Response) => {
    const request_id = req.params.request_id;
    const user = res.session?.user ?? null;
    const roles: string[] | null = JSON.parse(user?.roles ?? null);
    // TODO: response edit button for corporation
    const ret = {
        body: "",
        stickybutton_type: "",
    };
    const requestBody = await getRequestByRequestId(Number(request_id));

    ret.body = requestBody?.get({ plain: true });

    if (roles !== null && roles !== null && roles.includes("student")) {
        ret.stickybutton_type = "register";
    } else {
        ret.stickybutton_type = "";
    }

    res.json(ret);
});

export default RequestRouter;
