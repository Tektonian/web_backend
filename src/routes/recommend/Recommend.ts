import { getRecommendedRequestByStudent } from "../../controllers/wiip/RequestController";
import { getRecommendedStudentByRequest } from "../../controllers/wiip/StudentController";
import express, { Request, Response } from "express";
import { HandlerAPISpec, TspecAPISpec } from "api_spec";
import logger from "../../utils/logger";
const RecommendRouter = express.Router();

RecommendRouter.post("/students" satisfies keyof TspecAPISpec, (async (
    req,
    res,
) => {
    const { request_id } = req.body;
    logger.info("recommend router of student");
    const ret = await getRecommendedStudentByRequest(request_id);

    res.json(ret?.getOrNull());
}) as HandlerAPISpec);

RecommendRouter.post("/requests", async (req: Request, res: Response) => {
    if (req.body.request_id === undefined) {
        res.json("");
    }
    const ret = await getRecommendedRequestByStudent(req.body.request_id);

    res.json(ret);
});

export default RecommendRouter;
