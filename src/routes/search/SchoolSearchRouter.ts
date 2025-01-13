import express from "express";
import MeiliSearch from "meilisearch";
import { APISpec } from "api_spec";
import logger from "../../utils/logger";
const client = new MeiliSearch({
    host: process.env.MEILISEARCH_HOST,
    apiKey: process.env.MEILISEARCH_KEY,
});

const SchoolSearchRouter = express.Router();

SchoolSearchRouter.get("/" satisfies keyof APISpec.SearchSchoolAPISpec, (async (req, res) => {
    //const { country_code } = ValidateSchema(SchoolSearchScheme.ReqSearchSchoolScheme, req.query);
    const { country_code, q } = req.query;

    const index = client.index(`school-name-${country_code}`);

    const school = await index.search(q);

    res.json(school.hits);

    return;
}) as APISpec.SearchSchoolAPISpec["/"]["get"]["handler"]);

export default SchoolSearchRouter;
