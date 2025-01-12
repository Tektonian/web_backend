import express from "express";
import MeiliSearch from "meilisearch";
import { APISpec } from "api_spec";
import logger from "../../utils/logger";
import { LanguageExam } from "../../models/rdbms/LanguageExam";
/*
const client = new MeiliSearch({
    host: process.env.MEILISEARCH_HOST,
    apiKey: process.env.MEILISEARCH_KEY,
});
*/
const ExamSearchRouter = express.Router();

ExamSearchRouter.get("/" satisfies keyof APISpec.SearchExamAPISpec, (async (req, res) => {
    /*
    const index = client.index(`language-exam`);

    const exam = await index.getDocuments();

    res.json({
        status: "ok",
        ret: exam.results,
    });
    */
    const exams = await LanguageExam.findAll({ raw: true });
    res.status(200).json(exams);
    return;
}) as APISpec.SearchExamAPISpec["/"]["get"]["__handler"]);

export default ExamSearchRouter;
