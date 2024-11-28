import { Request, Response } from "express";
import { Student } from "../models/rdbms/Student";
import { StudentReview } from "../models/rdbms/StudentReview";
import { fullstudentprofile } from "../models/rdbms/fullstudentprofile";
import { Buffer } from "buffer";
import { sequelize } from "../models/rdbms";
import { AcademicHistory } from "../models/rdbms/AcademicHistory";
import { ExamHistory } from "../models/rdbms/ExamHistory";

export const getStudentByStudentId = async (student_id: number) => {
    const studentProfile = await fullstudentprofile.findOne({
        where: { student_id: student_id },
    });

    return studentProfile;
};

export const getInstReviewOfStudentByStudentId = async (student_id: number) => {
    const reviews = await StudentReview.findAll({
        where: { student_id: student_id },
    });

    return reviews;
};

// TODO: Add type later
export const createStudentIdentity = async (data) => {
    const transaction = await sequelize.transaction();

    try {
        const { userType, academicHistory, examHistory, ...student } = data;

        const createdStudent = await Student.create(
            {
                name_glb: student.name_glb,
                nationality: student.nationality,
                user_id: res.session.user.id,
                age: student.age,
                email_verified: student.email_verified,
                phone_number: student.phone_number,
                emergency_contact: student.emergency_contact,
                gender: student.gender,
                image: student.image,
                has_car: student.has_car,
                keyword_list: student.keyword_list,
            },
            { transaction },
        );

        const studentId = createdStudent.student_id;

        for (const history of academicHistory) {
            const isAttending = history.status === "In progress" ? 1 : 0;
            await AcademicHistory.create(
                {
                    school_id: history.school_id,
                    student_id: studentId,
                    degree: history.degree,
                    start_date: history.start_date,
                    end_date: history.end_date,
                    status: history.status,
                    faculty: history.faculty,
                    school_email: history.school_email,
                    is_attending: isAttending,
                },
                { transaction },
            );
        }

        for (const exam of examHistory) {
            await ExamHistory.create(
                {
                    student_id: studentId,
                    exam_id: exam.exam_id,
                    exam_result: exam.exam_result,
                },
                { transaction },
            );
        }

        await transaction.commit();

        return createdStudent;
    } catch (error) {
        await transaction.rollback();
        console.error("Transaction failed:", error);
        return null;
    }
};
