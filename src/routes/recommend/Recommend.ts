import express, { Request, Response } from "express";
import { getRecommendedStudentByRequest } from "../../controllers/wiip/StudentController";
import { getRecommendedRequestByStudent } from "../../controllers/wiip/RequestController";

const RecommendRouter = express.Router();

RecommendRouter.post("/students", async (req: Request, res: Response) => {
    const { request_id } = req.body;

    const ret = await getRecommendedStudentByRequest(request_id);

    res.json(ret);
});

RecommendRouter.post("/requests", async (req: Request, res: Response) => {
    if (req.query.studnet_id === undefined) {
        res.json("");
    }
    const ret = await getRecommendedRequestByStudent(
        Number(req.query.student_id),
    );

    console.log("ret:", ret);
    res.json(ret);
});

export default RecommendRouter;
