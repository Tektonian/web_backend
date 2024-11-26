import express, { Request, Response } from "express";
import { CorporationReview } from "../models/rdbms/CorporationReview";
import { Request as RequestModel } from "../models/rdbms/Request";
import { Consumer } from "../models/rdbms/Consumer";
import { Corporation } from "../models/rdbms/Corporation";

const CorporationReviewRouter = express.Router();

CorporationReviewRouter.all(
    "/:consumer_id",
    async (req: Request, res: Response) => {
        try {
            const consumer_id = req.params.consumer_id;
            const corporationReviews = await CorporationReview.findAll({
                where: { consumer_id },
            });

            const reviewData = await Promise.all(
                corporationReviews.map(async (review) => {
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

                    const consumer_corpId = await Consumer.findOne({
                        where: { consumer_id: reviewValues.consumer_id },
                        attributes: ["corp_id"],
                    });

                    const corporation_logoImage = await Corporation.findOne({
                        where: { corp_id: consumer_corpId?.dataValues.corp_id },
                        attributes: ["logo_image"],
                    });

                    const requestCard = request
                        ? {
                              ...request.dataValues,
                              logo_image: corporation_logoImage
                                  ? corporation_logoImage.dataValues.logo_image
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
    },
);

CorporationReviewRouter.post("/", async (req: Request, res: Response) => {
    try {
        const request = await RequestModel.findOne({
            where: { request_id: req.body.request_id },
            attributes: ["consumer_id"],
        });

        const consumer = request
            ? await Consumer.findOne({
                  where: { consumer_id: request.dataValues.consumer_id },
                  attributes: ["corp_id"],
              })
            : null;

        const createdReview = await CorporationReview.create({
            consumer_id: request?.dataValues.consumer_id ?? -1,
            student_id: req.body.student_id,
            corp_id: consumer?.dataValues.corp_id ?? -1,
            request_id: request?.dataValues.request_id ?? -1,
            request_url: `${request?.dataValues.request_id ?? -1}`,
            review_text: req.body.review_text,
            prep_requirement: req.body.prep_requirement,
            work_atmosphere: req.body.work_atmosphere,
            sense_of_achive: req.body.sense_of_achive,
        });

        console.log(createdReview.dataValues);
    } catch (err) {
        console.error(err);
    }
});

export default CorporationReviewRouter;
