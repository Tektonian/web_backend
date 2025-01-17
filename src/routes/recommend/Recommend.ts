import express from "express";
import { models } from "../../models/rdbms/index.js";
/**
 * Controller
 */
import { getRecommendedRequestByStudentId } from "../../controllers/wiip/RequestController.js";
import { getRecommendedStudentByRequestId } from "../../controllers/wiip/StudentController.js";
/**
 * Utils,
 */
import { APISpec } from "@mesh/api_spec";
import logger from "../../utils/logger.js";
import { pick } from "es-toolkit";

const Student = models.Student;
const RecommendRouter = express.Router();

RecommendRouter.post("/students" satisfies keyof APISpec.RecommendAPISpec, (async (req, res) => {
    logger.info("START-Get recommend student list");

    const result = await getRecommendedStudentByRequestId(req.body.request_id);

    // const ret = result.getOrNull();
    const ret = result.map((val) =>
        pick(val.get({ plain: true }), ["student_id", "name_glb", "has_car", "keyword_list"]),
    );
    res.status(200).json(ret);
    logger.info("END-Get recommend student list");
}) as APISpec.RecommendAPISpec["/students"]["post"]["__handler"]);

/**
 * TODO: 센션유저 타입에 따라서 response 달라지게 설정
 * 비로그인 / 학생 / 기업을 나눠서
 */
RecommendRouter.post("/requests" satisfies keyof APISpec.RecommendAPISpec, (async (req, res) => {
    logger.info("START-Get recommend request list");

    /**
     * TODO
     * const student = (await Student.findAll())[0].get({ plain: true });
     * const ret = await getRecommendedRequestByStudentId(student.student_id);
     * Return all for now
     */
    const ret = (await getRecommendedRequestByStudentId(-1)).map((val) =>
        pick(val.get({ plain: true }), [
            "request_id",
            "title",
            "reward_price",
            "currency",
            "address",
            "start_date",
            "request_status",
        ]),
    );

    res.status(200).json(ret);
    logger.info("END-Get recommend request list");
}) as APISpec.RecommendAPISpec["/requests"]["post"]["__handler"]);

export default RecommendRouter;
