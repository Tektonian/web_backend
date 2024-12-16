import { CorporationReview } from "../models/rdbms/CorporationReview";

export const getCorpReviewsByRequestId = async (requestId: number) => {
    return await CorporationReview.findAll({
        where: { request_id: requestId },
    });
};
