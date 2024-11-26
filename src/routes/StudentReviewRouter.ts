import express, { Request, Response } from "express";
import { StudentReview } from "../models/rdbms/StudentReview";
import { Request as RequestModel } from "../models/rdbms/Request";
import { Consumer } from "../models/rdbms/Consumer";
import { Corporation } from "../models/rdbms/Corporation";

const StudentReviewRouter = express.Router();

StudentReviewRouter.all("/:student_id", async (req: Request, res: Response) => {
    try {
        const student_id = req.params.student_id;
        const studentReviews = await StudentReview.findAll({
            where: { student_id },
        });

        const reviewData = await Promise.all(
            studentReviews.map(async (review) => {
                const reviewValues = review.dataValues;

                const request = await RequestModel.findOne({
                    where: { request_id: reviewValues.request_id },
                    attributes: [
                        "title",
                        "subtitle",
                        "reward_price",
                        "currency",
                        "address",
                        "start_date",
                    ],
                });

                const consumer = await Consumer.findOne({
                    where: { consumer_id: reviewValues.consumer_id },
                    attributes: ["corp_id"],
                });

                const corporation = consumer
                    ? await Corporation.findOne({
                          where: { corp_id: consumer.dataValues.corp_id },
                          attributes: ["logo_image"],
                      })
                    : null;

                const requestCard = request
                    ? {
                          ...request.dataValues,
                          logo_image: corporation
                              ? corporation.dataValues.logo_image
                              : null,
                      }
                    : null;

                return {
                    ...reviewValues,
                    request_card: requestCard,
                };
            }),
        );

        res.json(reviewData);
        console.log(reviewData);
    } catch (err) {
        console.error(err);
    }
});

export default StudentReviewRouter;
