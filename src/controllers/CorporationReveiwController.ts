import { CorporationReview } from "../models/rdbms/CorporationReview";
import { sequelize } from "../models/rdbms";
import { Request } from "../models/rdbms/Request";
import { getConsumerByReqId, getCorpByCsmId } from "./ConsumerController";
import { stringify } from "querystring";

export const getAllCorpReviewByCsmId = async (consumer_id: number) => {
    try {
        const reviews = await CorporationReview.findAll({
            where: { consumer_id },
        });

        const reviewCards = await Promise.all(
            reviews.map(async (reviewInstance) => {
                const review = reviewInstance.get({ plain: true });

                const request = await Request.findOne({
                    where: { request_id: review.request_id },
                    attributes: [
                        "title",
                        "subtitle",
                        "reward_price",
                        "currency",
                        "address",
                        "start_date",
                    ],
                });

                const requestPlain = request
                    ? request.get({ plain: true })
                    : null;

                const corpProfile = await getCorpByCsmId(consumer_id);
                const logo_image = corpProfile
                    ? corpProfile.get({ plain: true }).logo_image
                    : null;

                const requestCard = requestPlain
                    ? { ...requestPlain, logo_image }
                    : null;

                console.log(requestCard);

                return {
                    ...review,
                    requestCard: requestCard,
                };
            }),
        );

        return reviewCards;
    } catch (error) {
        console.error("Error in getAllCorpReviewByCsmId:", error);
        throw error;
    }
};

export const createCorporationReview = async (data) => {
    const consumer = await getConsumerByReqId(data.request_id);
    const consumer_id = consumer
        ? consumer.get({ plain: true }).consumer_id
        : null;
    const corp = consumer_id ? await getCorpByCsmId(consumer_id) : null;
    const corp_id = corp ? corp.get({ plain: true }).corp_id : null;

    if (consumer_id !== null && corp_id !== null) {
        const createdReview = await CorporationReview.create({
            consumer_id: consumer_id,
            corp_id: corp_id,
            request_url: stringify(data.request_id),
            ...data,
        });
        return createdReview;
    } else {
        return null;
    }
};
