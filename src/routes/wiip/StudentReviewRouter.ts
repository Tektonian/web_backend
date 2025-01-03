import express from "express";
import { StudentReview } from "../../models/rdbms/StudentReview";
import { APISpec } from "api_spec";
import { RequestEnum } from "api_spec/enum";
import logger from "../../utils/logger";
import * as Errors from "../../errors";
import { filterSessionByRBAC } from "../../middleware/auth.middleware";
import { getStudentReviewsByStudentId } from "../../controllers/wiip/StudentReviewController";
import { StudentReviewSchema } from "api_spec/joi";
import { ValidateSchema } from "../../utils/validation.joi";
import { pick } from "es-toolkit";
import { getUserByConsumerId } from "../../controllers/UserController";
import { getProviderOfRequestByStudentId } from "../../controllers/wiip/ProviderController";
import { getRequestByRequestId } from "../../controllers/wiip/RequestController";
import { Op } from "sequelize";
const StudentReviewRouter = express.Router();

StudentReviewRouter.post(
    "/" satisfies keyof APISpec.StudentReviewAPISpec,
    // Check login
    filterSessionByRBAC(),
    (async (req, res) => {
        logger.info("Start-Create student review");
        const { consumer_id, student_id, request_id, ...reviewData } = ValidateSchema(
            StudentReviewSchema.ReqCreateStudentReveiwSchema,
            req.body,
        );

        const sessionUser = res.session!.user;

        const consumerUser = (await getUserByConsumerId(consumer_id))?.get({ plain: true });
        const studentProvider = (await getProviderOfRequestByStudentId(request_id, student_id))?.get({ plain: true });

        const request = (await getRequestByRequestId(request_id))?.get({ plain: true });

        if (!consumerUser) {
            throw new Errors.ServiceExceptionBase("User requested wrong consumer id");
        } else if (!consumerUser.user_id.equals(sessionUser.id)) {
            throw new Errors.ServiceExceptionBase("Session user is not consumer of a request");
        }
        if (!studentProvider) {
            throw new Errors.ServiceExceptionBase("Student is not a provider of a request");
        }
        if (!request) {
            throw new Errors.ServiceExceptionBase("User requested wrong request id");
        } else if (request.request_status !== RequestEnum.REQUEST_STATUS_ENUM.FINISHED) {
            throw new Errors.ServiceExceptionBase("Request status is not FINISHED");
        }

        const checkAlreadyExist = await StudentReview.count({
            where: { [Op.and]: [{ request_id: request.request_id }, { student_id: studentProvider.student_id }] },
            // Ignore deleted item
            paranoid: true,
        });

        if (checkAlreadyExist) {
            throw new Errors.ServiceExceptionBase(`Review of student already created: ${checkAlreadyExist}`);
        }

        const createdReview = await StudentReview.create({
            consumer_id,
            student_id,
            request_id,
            request_url: "",
            ...reviewData,
        });
        res.status(200).end();
        logger.info("End-Create student review");
    }) as APISpec.StudentReviewAPISpec["/"]["post"]["__handler"],
);

StudentReviewRouter.get(
    "/list/:student_id" satisfies keyof APISpec.StudentReviewAPISpec,
    // need login
    filterSessionByRBAC(),
    (async (req, res) => {
        logger.info("START-Get student review list");
        const student_id = req.params.student_id;
        const sessionUser = res.session!.user;
        const userRoles = new Set(sessionUser.roles);

        if (!student_id) {
            throw new Errors.ServiceExceptionBase("User requested wrong student_id");
        }

        let studentReviews = (await getStudentReviewsByStudentId(student_id)).map((val) => val.get({ plain: true }));

        // If user is not corp nor orgn, filter corp and orgn reviews
        if (!userRoles.has("corp") && !userRoles.has("orgn")) {
            studentReviews = studentReviews.filter((val) => val.corp_id === undefined && val.orgn_id === undefined);
        }

        const studentReviewCards = studentReviews.map((review) =>
            pick(review, [
                "consumer_id",
                "student_id",
                "request_id",
                "was_late",
                "was_diligent",
                "was_proactive",
                "commu_ability",
                "lang_fluent",
                "goal_fulfillment",
                "want_cowork",
                "praise",
                "need_improve",
                "need_improve",
            ]),
        );

        res.status(200).json(studentReviewCards);
        logger.info("END-Get student review list");
    }) as APISpec.StudentReviewAPISpec["/list/:student_id"]["get"]["handler"],
);

export default StudentReviewRouter;
