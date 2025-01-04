import { models } from "../../models/rdbms";
import { MeiliSearch } from "meilisearch";
import { Student } from "../../models/rdbms/Student";
import { StudentReview } from "../../models/rdbms/StudentReview";
import { fullstudentprofile } from "../../models/rdbms/fullstudentprofile";
import { sequelize } from "../../models/rdbms";
import { AcademicHistory } from "../../models/rdbms/AcademicHistory";
import { School } from "../../models/rdbms/School";
import { Request } from "../../models/rdbms/Request";
import { ExamHistory } from "../../models/rdbms/ExamHistory";
import { DataTypes } from "sequelize";
import { runCatchingAsync } from "../../utils/runCatcher";

import logger from "../../utils/logger";
import { APIType } from "api_spec";
import { Corporation } from "../../models/rdbms/Corporation";

const client = new MeiliSearch({
    host: "http://127.0.0.1:7700",
    apiKey: "1zBmtAMDjgWPGLcTPAhEy-kRZv44BzxywQ1UHPkIYE0",
});

const studentSearch = client.index("studentwithcurrentschool");
// studentSearch.updateFilterableAttributes(["_geo"]);
// studentSearch.updateSortableAttributes(["_geo"]);

export const getRecommendedStudentByRequestId = async (request_id: number) => {
    const reqResult = await runCatchingAsync(async () =>
        (
            await Request.findOne({
                where: { request_id: request_id },
            })
        )?.get({ plain: true }),
    );

    const request = reqResult.getOrNull();
    const elseval = reqResult.getOrElse(() => 2);
    const coordi = JSON.parse(JSON.stringify(request?.address_coordinate)).coordinates;

    const ret = await runCatchingAsync(async () =>
        studentSearch.search("", {
            filter: [`_geoRadius(${coordi[0]}, ${coordi[1]}, 1000000000000)`],
            sort: [`_geoPoint(${coordi[0]}, ${coordi[1]}):asc`],
        }),
    );

    ret.onFailure((error) => {
        logger.info(`Student search failed ${error}`);
    });

    ret.onSuccess(() => {
        logger.info("Student search success");
    });

    return ret;
};

export const getStudentFullProfileByStudentId = async (student_id: number) => {
    const studentProfile = await fullstudentprofile.findOne({
        where: { student_id: student_id },
        attributes: { exclude: ["user_id", "id"] },
    });

    return studentProfile;
};

export const getStudentByStudentId = async (studentId) => {
    return await Student.findOne({ where: { student_id: studentId } });
};

export const getStudentByUserId = async (user_id: Buffer | null) => {
    if (!user_id) {
        console.error("userid is null");
    }

    const studentProfile = await Student.findOne({
        where: { user_id: user_id },
        attributes: { exclude: ["user_id"] },
    });

    return studentProfile;
};

// api_spec 에 데이터 타입 맞춰서 리턴하도록
export const getInstReviewOfStudentByStudentId = async (student_id: number) => {
    const reviews = await StudentReview.findAll({
        where: { student_id: student_id },
        attributes: { exclude: ["user_id"] },
    });
    return reviews;
};

// TODO: Add type laterㅇ
export const createUnVerifiedStudentIdentity = async (uuid: typeof DataTypes.UUID, data) => {
    try {
        const ret = await sequelize.transaction(async (t) => {
            const { userType, academicHistory, examHistory, ...student } = data;

            const createdStudent = await Student.create(
                {
                    name_glb: student.name_glb,
                    nationality: student.nationality,
                    user_id: uuid,
                    age: student.age,
                    phone_number: student.phone_number,
                    emergency_contact: student.emergency_contact,
                    gender: student.gender,
                    image: student.image,
                    has_car: student.has_car,
                    keyword_list: student.keyword_list,
                },
                { transaction: t },
            );

            const studentId = createdStudent.student_id;

            let searchDocument = {
                id: studentId,
                ...createdStudent.dataValues,
            };

            for (const history of academicHistory) {
                const isAttending = history.status === "In progress" ? 1 : 0;
                const acaHistory = await AcademicHistory.create(
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
                    { transaction: t },
                );
                if (isAttending === 1) {
                    const school = (await School.findByPk(history.school_id))?.get({ plain: true });
                    console.log(school);
                    searchDocument = {
                        ...searchDocument,
                        _geo: {
                            lat: school.coordinate.coordinates[0],
                            lng: school.coordinate.coordinates[1],
                        },
                    };
                }
            }

            searchDocument = {
                ...searchDocument,
                academicHistory: academicHistory,
                examHistory: examHistory,
            };

            const searchRet = await studentSearch.addDocuments([searchDocument], { primaryKey: "id" });

            const searchTask = await client.waitForTask(searchRet.taskUid);

            for (const exam of examHistory) {
                await ExamHistory.create(
                    {
                        student_id: studentId,
                        exam_id: exam.exam_id,
                        exam_result: exam.exam_result,
                    },
                    { transaction: t },
                );
            }

            if (searchTask.status !== "succeeded") {
                throw new Error("No record created " + JSON.stringify(searchTask));
            }
            return createdStudent;
        });

        return ret;
    } catch (error) {
        console.error("Create student profile failed:", error);
        return undefined;
    }
};
