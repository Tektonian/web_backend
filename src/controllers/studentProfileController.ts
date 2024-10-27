import { Request, Response } from "express";
import StudentProfile from "../models/studentProfile";

export const createStudentProfile = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const studentProfile = await StudentProfile.create(req.body);
    res.json(studentProfile);
};

export const getAllStudentProfile = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const studentProfile = await StudentProfile.findAll();
    res.json(studentProfile);
};

export const getStudentProfileById = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const studentProfile = await StudentProfile.findByPk(req.params.id);
    if (!studentProfile) {
        res.json({ error: "Request info not found" });
        return;
    }
    res.json(studentProfile);
};

export const updateStudentProfile = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const studentProfile = await StudentProfile.findByPk(req.params.id);
    if (!studentProfile) {
        res.json({ error: "Request info not found" });
        return;
    }

    await studentProfile.update(req.body);
    res.json(studentProfile);
};

export const deleteStudentProfile = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const studentProfile = await StudentProfile.findByPk(req.params.id);
    if (!studentProfile) {
        res.json({ error: "Request info not found" });
        return;
    }

    await studentProfile.destroy();
    res.json({ message: "Request info deleted successfully" });
};
