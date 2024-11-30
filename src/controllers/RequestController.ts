import { Request, Response } from "express";
import { Request as RequestData } from "../models/rdbms/Request";
import type { RequestAttributes } from "../models/rdbms/Request";

export const getRequestByRequestId = async (request_id: number) => {
    const requestBody = await RequestData.findOne({
        where: { request_id: request_id },
    });
    return requestBody;
};

export const createRequestBody = async (data) => {
    const createRequest = await RequestData.create({ ...data });
    return createRequest;
};
