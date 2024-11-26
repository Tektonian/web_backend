import express, { Request, Response } from "express";
import { AcademicHistory } from "../models/rdbms/AcademicHistory";

const AcademicHistoryRouter = express.Router();

AcademicHistoryRouter.post(
    "/:student_id",
    async (req: Request, res: Response) => {
        try {
            const studentId = Number(req.params.student_id);
            const academicHistoryArray = req.body;

            for (const history of academicHistoryArray) {
                const academicHistory = await AcademicHistory.create({
                    school_id: history.school_id,
                    student_id: studentId,
                    degree: history.degree,
                    start_date: history.start_date,
                    end_date: history.end_date,
                    status: history.status,
                    faculty: history.faculty,
                    school_email: history.school_email,
                    is_attending: history.is_attending,
                });
            }
        } catch (error) {
            console.error(error);
        }
    },
);

export default AcademicHistoryRouter;
