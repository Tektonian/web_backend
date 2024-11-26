import { Request, Response } from "express";
import RequestInfo from "../models/rdbms/requestInfo";

export const createRequestInfo = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const requestInfo = await RequestInfo.create(req.body);
    res.json(requestInfo);
};

export const getAllRequestInfo = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const requestInfos = await RequestInfo.findAll();
    res.json(requestInfos);
};

export const getRequestInfoById = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const requestInfo = await RequestInfo.findByPk(req.params.id);
    if (!requestInfo) {
        res.json({ error: "Request info not found" });
        return;
    }
    res.json(requestInfo);
};

export const updateRequestInfo = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const requestInfo = await RequestInfo.findByPk(req.params.id);
    if (!requestInfo) {
        res.json({ error: "Request info not found" });
        return;
    }

    await requestInfo.update(req.body);
    res.json(requestInfo);
};

export const deleteRequestInfo = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const requestInfo = await RequestInfo.findByPk(req.params.id);
    if (!requestInfo) {
        res.json({ error: "Request info not found" });
        return;
    }

    await requestInfo.destroy();
    res.json({ message: "Request info deleted successfully" });
};
