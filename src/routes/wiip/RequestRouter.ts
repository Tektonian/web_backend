import express, { Request, Response } from "express";
import { APISpec } from "api_spec";
import {
    createRequest,
    getRequestByRequestId,
} from "../../controllers/wiip/RequestController";

const RequestRouter = express.Router();

RequestRouter.post("/" satisfies keyof APISpec.RequestAPISpec, (async (
    req,
    res,
) => {
    const user = res.session?.user;
    const { data, role } = req.body;

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
}) as APISpec.RequestAPISpec["/"]["post"]["__handler"]);

RequestRouter.get(
    "/:request_id" satisfies keyof APISpec.RequestAPISpec,
    (async (req, res) => {
        const request_id = req.params.request_id;
        const roles = res.session?.user.roles;

        const request = (await getRequestByRequestId(Number(request_id)))?.get({
            plain: true,
        });

        res.json({ data: request, status: "ok" });
    }) as APISpec.RequestAPISpec["/:request_id"]["get"]["__handler"],
);

RequestRouter.put("/update", async (req, res) => {});

export default RequestRouter;
