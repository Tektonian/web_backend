/**
 * Models
 */
import { models } from "../../models/rdbms";
import { MeiliSearch } from "meilisearch";
import { sequelize } from "../../models/rdbms";
/**
 * Utiles, Types
 */
import { runCatchingAsync } from "../../utils/runCatcher";

import logger from "../../utils/logger";
import { APIType } from "api_spec";
import { LanguageExam } from "../../models/rdbms/LanguageExam";

const Student = models.Student;
const StudentReview = models.StudentReview;
const AcademicHistory = models.AcademicHistory;
const School = models.School;
const Request = models.Request;
const ExamHistory = models.ExamHistory;

const client = new MeiliSearch({
    host: process.env.MEILISEARCH_HOST as string,
    apiKey: process.env.MEILISEARCH_KEY,
});

const studentSearch = client.index("student");
// studentSearch.updateFilterableAttributes(["_geo"]);
// studentSearch.updateSortableAttributes(["_geo"]);

export const getRecommendedStudentByRequestId = async (request_id: number) => {
    /*
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
    */
    const allStudents = await Student.findAll({
        limit: 999,
    });
    return allStudents;
};

export const getStudentByStudentId = async (studentId: number) => {
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
export const createUnVerifiedStudentIdentity = async (userId: Buffer, data) => {
    try {
        const ret = await sequelize.transaction(async (t) => {
            const { academic_history, exam_history, ...student } = data;
            const createdStudent = await Student.create(
                {
                    name_glb: student.name_glb,
                    user_id: userId,
                    birth_date: student.birth_date,
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

            for (const history of academic_history) {
                const isAttending = history.status === "In progress" ? 1 : 0;
                // change to string id to buffer
                history.school_id = Buffer.from(history.school_id, "hex");
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
                academic_history: academic_history,
                exam_history: exam_history,
            };

            const searchRet = await studentSearch.addDocuments([searchDocument], { primaryKey: "id" });

            const searchTask = await client.waitForTask(searchRet.taskUid);

            for (const exam of exam_history) {
                exam.exam_id = Buffer.from(exam.exam_id, "hex");
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

export const updateStudentProfileByUserId = async (
    userId: Buffer,
    data: APIType.StudentType.ReqUpdateStudentProfile,
) => {
    const updateCount = await Student.update(
        {
            name_glb: data.name_glb,
            phone_number: data.phone_number,
            emergency_contact: data.emergency_contact,
            birth_date: data.birth_date,
            gender: data.gender,
            has_car: data.has_car,
            keyword_list: data.keyword_list,
        },
        { where: { user_id: userId } },
    );

    return updateCount;
};
