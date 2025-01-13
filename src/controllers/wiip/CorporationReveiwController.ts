import { models } from "../../models/rdbms";
import type { CorporationReviewAttributes } from "../../models/rdbms/CorporationReview";

const CorporationReview = models.CorporationReview;

export const createCorpReview = async (data: CorporationReviewAttributes) => {
    return await CorporationReview.create(data);
};

export const getCorpReviewsByRequestId = async (requestId: number) => {
    return await CorporationReview.findAll({
        where: { request_id: requestId },
    });
};

export const getCorpReviewsByCorpId = async (corpId: number) => {
    return await CorporationReview.findAll({
        where: { corp_id: corpId },
    });
};
