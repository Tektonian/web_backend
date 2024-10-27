import { Request, Response } from "express";
import CorpProfile from "../models/corpProfile";

export const createCorpProfile = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const corpProfile = await CorpProfile.create(req.body);
    res.json(corpProfile);
};

export const getAllCorpProfile = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const corpProfiles = await CorpProfile.findAll();
    res.json(corpProfiles);
};

export const getCorpProfileById = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const corpProfile = await CorpProfile.findByPk(req.params.id);
    if (!corpProfile) {
        res.json({ error: "Request info not found" });
        return;
    }
    res.json(corpProfile);
};

export const updateCorpProfile = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const corpProfile = await CorpProfile.findByPk(req.params.id);
    if (!corpProfile) {
        res.json({ error: "Request info not found" });
        return;
    }

    await corpProfile.update(req.body);
    res.json(corpProfile);
};

export const deleteCorpProfile = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const corpProfile = await CorpProfile.findByPk(req.params.id);
    if (!corpProfile) {
        res.json({ error: "Request info not found" });
        return;
    }

    await corpProfile.destroy();
    res.json({ message: "Request info deleted successfully" });
};
