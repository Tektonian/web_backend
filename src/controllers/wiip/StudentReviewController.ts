import { StudentReview } from "../../models/rdbms/StudentReview";

export const getStudentReviewsByRequestId = async (requestId: number) => {
    return await StudentReview.findAll({ where: { request_id: requestId } });
};
