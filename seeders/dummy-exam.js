const { Meilisearch } = require("meilisearch");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const fs = require("fs");
        const ExamDataset = JSON.parse(fs.readFileSync("../../school_dataset/exam/exam.json", "utf-8"));

        const MeiliSearch = require("meilisearch").MeiliSearch;
        const meilisearchHost =
            process.env.NODE_ENV === "production" ? process.env.MEILISEARCH_HOST : "http://127.0.0.1:7700";

        const client = new MeiliSearch({
            host: meilisearchHost,
            apiKey: process.env.MEILISEARCH_KEY,
        });

        const db = require("../models");
        const LanguageExam = db.sequelize.models.LanguageExam;

        const LanguageExamData = ExamDataset.map((exam) => ({
            exam_id: Buffer.from(exam.exam_id.replaceAll("-", ""), "hex"),
            exam_name_glb: exam.exam_name_glb,
            exam_result_type: exam.exam_type,
            exam_results: exam.exam_results ?? null,
            exam_level: exam.exam_level ?? null,
            lang_country_code: exam.lang_country_code,
        }));

        const LanguageExamSearchData = ExamDataset.map((exam) => ({
            exam_id: exam.exam_id,
            exam_name_glb: exam.exam_name_glb,
            exam_result_type: exam.exam_type,
            exam_results: exam.exam_results ?? null,
            exam_level: exam.exam_level ?? null,
            lang_country_code: exam.lang_country_code,
        }));

        try {
            await LanguageExam.bulkCreate(LanguageExamData);

            const index = client.index("language-exam");
            await index.addDocuments(LanguageExamSearchData, {
                primaryKey: "exam_id",
            });

            console.log("Data successfully inserted into DB and Meilisearch.");
        } catch (error) {
            console.log("Validation Error in LanguageExam.bulkCreate", error);
            throw error;
        }

        const Student = db.sequelize.models.Student;
        const ExamHistory = db.sequelize.models.ExamHistory;

        const allStudents = await Student.findAll({ raw: true });

        await Promise.all(
            allStudents.map(async (val) => {
                for (let i = 0; i < 2; i++) {
                    await ExamHistory.create({
                        student_id: val.student_id,
                        exam_id: LanguageExamData[Math.floor(Math.random() * LanguageExamData.length)].exam_id,
                        level: [1, 2, 3].at(Math.floor(Math.random() * 3)),
                    });
                }
                return;
            }),
        );
    },

    async down(queryInterface, Sequelize) {
        const MeiliSearch = require("meilisearch").MeiliSearch;
        const meilisearchHost =
            process.env.NODE_ENV === "production" ? process.env.MEILISEARCH_HOST : "http://127.0.0.1:7700";

        const client = new MeiliSearch({
            host: meilisearchHost,
            apiKey: process.env.MEILISEARCH_KEY,
        });
        client.index("language-exam").deleteAllDocuments();
        await queryInterface.bulkDelete("ExamHistory", null, {});
        await queryInterface.bulkDelete("LanguageExam", null, {});
    },
};
