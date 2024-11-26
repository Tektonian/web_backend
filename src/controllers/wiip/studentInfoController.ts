import { models } from "../../models/rdbms";
import { MeiliSearch } from "meilisearch";

const client = new MeiliSearch({
    host: "http://127.0.0.1:7700",
    apiKey: "1zBmtAMDjgWPGLcTPAhEy-kRZv44BzxywQ1UHPkIYE0",
});
const Request = models.Request;

const StudentWithCurrentSchool = models.studentwithcurrentschool;

export const getRecommendedStudentByRequest = async (request_id: number) => {
    const request = (
        await Request.findOne({
            where: { request_id: request_id },
        })
    )?.get({ plain: true });

    console.log("Request", request);
    const coordi = JSON.parse(
        JSON.stringify(request?.address_coordinate),
    ).coordinates;

    const searchRet = await client
        .index("studentwithcurrentschool")
        .search("", {
            filter: [`_geoRadius(${coordi[0]}, ${coordi[1]}, 100000)`],
        });

    return searchRet;
};
