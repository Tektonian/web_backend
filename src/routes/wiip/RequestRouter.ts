import express, { Request, Response } from "express";
import { APISpec } from "api_spec";
import {
    createRequest,
    getRequestByRequestId,
} from "../../controllers/wiip/RequestController";
import { getUserByConsumerId } from "../../controllers/UserController";
import { updateRequestStatus } from "../../controllers/wiip/RequestController";
import logger from "../../utils/logger";

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

RequestRouter.put("/update" satisfies keyof APISpec.RequestAPISpec, (async (
    req,
    res,
) => {
    logger.info("START-Update request status");
    const sessionUser = res.session?.user;
    const { request_id, update } = req.body;

    if (sessionUser === undefined) {
        res.json("Login first");
        return;
    }

    try {
        const request = (await getRequestByRequestId(request_id))?.get({
            plain: true,
        });

        if (request === undefined) {
            res.json("No such request");
            return;
        }

        const user = (await getUserByConsumerId(request.consumer_id))?.get({
            plain: true,
        });

        if (user === undefined) {
            res.json("Db error");
            return;
        }

        // Session user wrote a request
        if (!user.user_id.equals(sessionUser.id)) {
            res.json("No permission");
            return;
        }

        const ret = await updateRequestStatus(request.request_id, update);
        if (ret === undefined) {
            res.json("Update failed");
            throw new Error("Update failed");
        }
        return;
    } catch (error) {
        logger.error(`FAILED-Update request status: ${error}`);
    }

    logger.info(`END-Update request status`);
}) as APISpec.RequestAPISpec["/update"]["put"]["__handler"]);

export default RequestRouter;
