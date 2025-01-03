import express from "express";
import { StudentReview } from "../../models/rdbms/StudentReview";
import { Request as RequestModel } from "../../models/rdbms/Request";
import { APISpec } from "api_spec";
import { Consumer } from "../../models/rdbms/Consumer";
import logger from "../../utils/logger";
import { User } from "../../models/rdbms/User";
import * as Errors from "../../errors";
import { filterSessionByRBAC } from "../../middleware/auth.middleware";
import { getStudentReviewsByStudentId } from "../../controllers/wiip/StudentReviewController";
import { pick } from "es-toolkit";
const StudentReviewRouter = express.Router();

StudentReviewRouter.post("/" satisfies keyof APISpec.StudentReviewAPISpec, (async (req, res) => {
    logger.info("Start-Create student review");
    const { consumer_id, student_id, request_id, ...reviewData } = req.body;
    const sessionUser = res.session?.user;

    if (sessionUser === undefined) {
        res.json("Login first");
        return;
    }
    const user = (
        await User.findOne({
            where: { user_id: sessionUser.id },
        })
    )?.get({ plain: true });

    if (user === undefined) {
        res.json("Db error");
        return;
    }

    const request = (
        await RequestModel.findOne({
            where: { request_id },
            attributes: ["student_id"],
        })
    )?.get({ plain: true });

    if (request === undefined) {
        res.json("No such request or Db error");
        return;
    }

    const consumer = (
        await Consumer.findOne({
            where: { consumer_id: consumer_id },
        })
    )?.get({ plain: true });

    if (consumer === undefined) {
        res.json("No such consumer");
        return;
    } else if (!consumer.user_id.equals(sessionUser.id)) {
        res.json("Wrong consumer");
        return;
    }

    try {
        const createdReview = await StudentReview.create({
            consumer_id,
            student_id,
            request_id,
            request_url: "",
            ...reviewData,
        });
        res.json({ status: "ok" });
        logger.info("End-Create student review");
    } catch (error) {
        logger.error(`Error creating student review: ${error}`);
        res.json({ status: "failed" });
    }
    return;
}) as APISpec.StudentReviewAPISpec["/"]["post"]["__handler"]);

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
            studentReviews = studentReviews.filter((val) => val.corp_id !== undefined || val.orgn_id !== undefined);
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
