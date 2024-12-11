import express from "express";
import { StudentReview } from "../../models/rdbms/StudentReview";
import { Request as RequestModel } from "../../models/rdbms/Request";
import { APISpec } from "api_spec";
import { Consumer } from "../../models/rdbms/Consumer";
import logger from "../../utils/logger";
import { User } from "../../models/rdbms/User";
const StudentReviewRouter = express.Router();

StudentReviewRouter.post(
    "/" satisfies keyof APISpec.StudentReviewAPISpec,
    (async (req, res) => {
        logger.info("Start-Create student review");
        const { consumer_id, student_id, request_id, ...reviewData } = req.body;
        const sessionUser = res.session.user;

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
            res.json("No such request");
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
        } else if (consumer.user_id.equals(sessionUser.id)) {
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
    }) as APISpec.StudentReviewAPISpec["/"]["post"]["__handler"],
);

export default StudentReviewRouter;
