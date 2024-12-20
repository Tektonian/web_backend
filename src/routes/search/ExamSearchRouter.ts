import express from "express";
import MeiliSearch from "meilisearch";
import { APISpec } from "api_spec";
import logger from "../../utils/logger";

const client = new MeiliSearch({
    host: "http://127.0.0.1:7700",
    apiKey: "1zBmtAMDjgWPGLcTPAhEy-kRZv44BzxywQ1UHPkIYE0",
});

const ExamSearchRouter = express.Router();

ExamSearchRouter.get("/" satisfies keyof APISpec.SearchExamAPISpec, (async (req, res) => {
    const index = client.index(`language-exam`);

    const exam = await index.getDocuments();

    res.json({
        status: "ok",
        ret: exam.results,
    });

    return;
}) as APISpec.SearchExamAPISpec["/"]["get"]["__handler"]);

export default ExamSearchRouter;
