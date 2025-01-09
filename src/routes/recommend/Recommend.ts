import { getRecommendedRequestByStudentId } from "../../controllers/wiip/RequestController";
import { getRecommendedStudentByRequestId } from "../../controllers/wiip/StudentController";
import express, { Request, Response } from "express";
import { APISpec } from "api_spec";
import logger from "../../utils/logger";
import { Student } from "../../models/rdbms/Student";
const RecommendRouter = express.Router();

RecommendRouter.post("/students" satisfies keyof APISpec.RecommendAPISpec, (async (req, res) => {
    logger.info("START-Get recommend student list");

    const result = await getRecommendedStudentByRequestId(req.body.request_id);

    const ret = result.getOrNull();

    res.status(200).json(ret?.hits);
    logger.info("START-Get recommend student list");
}) as APISpec.RecommendAPISpec["/students"]["post"]["__handler"]);

/**
 * TODO: 센션유저 타입에 따라서 response 달라지게 설정
 * 비로그인 / 학생 / 기업을 나눠서
 */
RecommendRouter.post("/requests" satisfies keyof APISpec.RecommendAPISpec, (async (req, res) => {
    logger.info("START-Get recommend request list");

    const student = (await Student.findAll())[0].get({ plain: true });

    const ret = await getRecommendedRequestByStudentId(student.student_id);

    res.status(200).json(ret?.hits);
    logger.info("END-Get recommend request list");
}) as APISpec.RecommendAPISpec["/requests"]["post"]["__handler"]);

export default RecommendRouter;
