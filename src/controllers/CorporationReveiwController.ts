import { CorporationReview } from "../models/rdbms/CorporationReview";
import { getCorpByConsumerId } from "./wiip/CorporationController";
import { Request } from "../models/rdbms/Request";
import { stringify } from "querystring";

export const getCorpReviewsByRequestId = async (requestId: number) => {
    return await CorporationReview.findAll({
        where: { request_id: requestId },
    });
};

// Min
// TODO: Fix
export const createCorporationReview = async (data) => {
    /*
    const consumer = await getConsumerByReqId(data.request_id);
    const consumer_id = consumer
        ? consumer.get({ plain: true }).consumer_id
        : null;
    const corp = consumer_id ? await getCorpByConsumerId(consumer_id) : null;
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
    */
};
