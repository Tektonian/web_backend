const { Meilisearch } = require("meilisearch");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const fs = require("fs");
        const ExamDataset = JSON.parse(
            fs.readFileSync("../../school_dataset/exam.json", "utf-8"),
        );
        const client = new Meilisearch({
            host: "http://127.0.0.1:7700",
            // apikey if needed'
        });

        const db = require("../models");
        const LanguageExam = db.sequelize.models.LanguageExam;

        const LanguageExamData = ExamDataset.map((exam) => ({
            exam_id: exam.id,
            exam_name_glb: { en: exam.en, kr: exam.kr, jp: exam.jp },
            exam_result_type: exam.exam_type,
            exam_results: exam.exam_results ?? null,
            exam_level: exam.exam_level ?? null,
            lang_country_code: exam.lang_country_code,
        }));

        try {
            await LanguageExam.bulkCreate(LanguageExamData);

            const index = client.index("language-exam");
            await index.addDocuments(LanguageExamData, {
                primaryKey: "exam_id",
            });

            console.log("Data successfully inserted into DB and Meilisearch.");
        } catch (error) {
            console.log("Validation Error in LanguageExam.bulkCreate", error);
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("LanguageExam", null, {});
        await queryInterface.bulkDelete("ExamHistory", null, {});
    },
};
