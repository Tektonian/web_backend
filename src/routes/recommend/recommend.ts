import express, { Request, Response } from "express";
import { getRecommendedStudentByRequest } from "../../controllers/wiip/studentInfoController";
import { getRecommendedRequestByStudent } from "../../controllers/wiip/requestController";

const RecommendRouter = express.Router();

RecommendRouter.post("/students", async (req: Request, res: Response) => {
    const { request_id } = req.body;

    const ret = await getRecommendedStudentByRequest(request_id);

    res.json(ret);
});

RecommendRouter.post("/requests", async (req: Request, res: Response) => {
    const ret = await getRecommendedRequestByStudent(888);

    res.json(ret);
});

export default RecommendRouter;
