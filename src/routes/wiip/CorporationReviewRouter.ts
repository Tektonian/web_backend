import express, { Request, Response } from "express";
import { createCorpReview, getCorpReviewsByCorpId } from "../../controllers/wiip/CorporationReveiwController";
import { getStudentByStudentId, getStudentByUserId } from "../../controllers/wiip/StudentController";
import { getUserByName } from "../../controllers/wiip/UserController";
import * as Errors from "../../errors";
import { APISpec } from "api_spec";
import { filterSessionByRBAC } from "../../middleware/auth.middleware";
import { pick } from "es-toolkit";
import logger from "../../utils/logger";
const CorporationReviewRouter = express.Router();

CorporationReviewRouter.post("/", async (req: Request, res: Response) => {
    const request_id = req.body.request_id;
    const review_body = req.body;
    const username = res.session?.user.name ?? null;
    const user = await getUserByName(username);
    const user_id = user?.get({ plain: true }).user_id;
    const student = await getStudentByUserId(user_id);
    const student_id = student ? student.get({ plain: true }).student_id : null;

    if (!student_id) {
        console.log("user is not student");
        return;
    }

    const fullreview = {
        request_id: request_id,
        student_id: student_id,
        ...review_body,
    };

    console.log(fullreview);

    const ret = await createCorpReview(fullreview);

    if (ret === null) {
        res.status(500).json({ message: "Internal Server Error" });
    } else {
        res.status(201).json({
            message: "Corp Review created successfully",
            student: ret,
        });
    }
});

CorporationReviewRouter.get(
    "/:corp_id" satisfies keyof APISpec.CorporationReviewAPISpec,
    // Only student can request corp review
    filterSessionByRBAC(["student"]),
    (async (req, res) => {
        logger.info("START-Get Corporation review card");
        const corp_id = req.params.corp_id;
        const sessionUser = res.session!.user;

        if (!corp_id) {
            throw new Errors.ServiceExceptionBase(`User requested wrong corp_id ${corp_id}`);
        }

        const reviews = (await getCorpReviewsByCorpId(corp_id)).map((val) => val.get({ plain: true }));

        const reviewCard = await Promise.all(
            reviews.map(async (review) => {
                const student = (await getStudentByStudentId(review.student_id))?.get({ plain: true });
                if (!student) {
                    throw new Errors.ServiceExceptionBase(`User requested wrong corp_id ${corp_id}`);
                }
                return {
                    request_id: review.request_id,
                    review_text: review.review_text,
                    prep_requirement: review.prep_requirement,
                    work_atmosphere: String(review.work_atmosphere),
                    sense_of_achive: review.sense_of_achive,
                    student_id: String(review.student_id),
                    student_name: JSON.stringify(student.name_glb),
                    student_image: student.image,
                };
            }),
        );

        res.status(200).json({ review: reviewCard });

        logger.info("END-Get Corporation review card");
    }) as APISpec.CorporationReviewAPISpec["/:corp_id"]["get"]["handler"],
);

export default CorporationReviewRouter;
