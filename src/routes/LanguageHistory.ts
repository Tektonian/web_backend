import express, { Request, Response } from "express";
import { ExamHistory } from "../models/rdbms/ExamHistory";

const ExamHistoryRouter = express.Router();

ExamHistoryRouter.post("/:student_id", async (req: Request, res: Response) => {
    try {
        const studentId = Number(req.params.student_id);
        const examHistorieArray = req.body.languageHistory;

        for (const history of examHistorieArray) {
            const examHistory = await ExamHistory.create({
                student_id: studentId,
                exam_id: req.body.exam_id,
                exam_result: req.body.exam_result,
            });
        }
    } catch (error) {
        console.error(error);
    }
});

export default ExamHistoryRouter;
