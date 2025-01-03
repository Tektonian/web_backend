import express from "express";
import MeiliSearch from "meilisearch";
import { APISpec } from "api_spec";
import { SchoolSearchScheme } from "api_spec/joi";
import { ValidateSchema } from "../../utils/validation.joi";
import logger from "../../utils/logger";
const client = new MeiliSearch({
    host: "http://127.0.0.1:7700",
    apiKey: "1zBmtAMDjgWPGLcTPAhEy-kRZv44BzxywQ1UHPkIYE0",
});

const SchoolSearchRouter = express.Router();

SchoolSearchRouter.get("/" satisfies keyof APISpec.SearchSchoolAPISpec, (async (req, res) => {
    const { country_code } = ValidateSchema(SchoolSearchScheme.ReqSearchSchoolScheme, req.query);

    const index = client.index(`school-name-${country_code}`);

    const school = await index.getDocuments();

    res.json({
        status: "ok",
        ret: school.results,
    });

    return;
}) as APISpec.SearchSchoolAPISpec["/"]["get"]["handler"]);

export default SchoolSearchRouter;
