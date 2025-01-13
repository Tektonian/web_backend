import { models } from "../../models/rdbms";

const StudentReview = models.StudentReview;

export const getStudentReviewsByRequestId = async (requestId: number) => {
    return await StudentReview.findAll({ where: { request_id: requestId } });
};

export const getStudentReviewsByStudentId = async (studentId: number) => {
    return await StudentReview.findAll({ where: { student_id: studentId } });
};
