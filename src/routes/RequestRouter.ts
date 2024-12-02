import express, { Request, Response } from "express";
import { Request as RequestModel } from "../models/rdbms/Request";
import {
    createRequest,
    getRequestByRequestId,
} from "../controllers/wiip/RequestController";

const RequestRouter = express.Router();

RequestRouter.post("/", async (req: Request, res: Response) => {
    const user = res.session?.user ?? undefined;

    const role = req.body.role;
    const data = req.body.data;

    if (user === undefined) {
        res.json("Login first");
        return;
    }
    if (!user.roles.includes(role)) {
        res.json("Incorrect role");
        return;
    }

    const request_id = await createRequest(user.id, role, data);

    if (request_id === undefined) {
        res.status(500).json({ message: "Internal Server Error" });
    } else {
        res.status(201).json({
            message: "Request Body created successfully",
            request_id: request_id,
        });
    }
});

RequestRouter.get("/:request_id", async (req: Request, res: Response) => {
    const request_id = req.params.request_id;
    const user = res.session?.user ?? null;
    const roles: string[] = user?.roles ?? null;
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
