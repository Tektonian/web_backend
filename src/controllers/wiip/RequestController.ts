import { models } from "../../models/rdbms";
import { MeiliSearch } from "meilisearch";

const client = new MeiliSearch({
    host: "http://127.0.0.1:7700",
    apiKey: "1zBmtAMDjgWPGLcTPAhEy-kRZv44BzxywQ1UHPkIYE0",
});

const requestIdx = client.index("request");
requestIdx.updateFilterableAttributes(["_geo"]);

const StudentWithCurrentSchool = models.studentwithcurrentschool;

export const getRecommendedRequestByStudent = async (student_id: number) => {
    const student = (
        await StudentWithCurrentSchool.findOne({
            where: { student_id: student_id },
        })
    )?.get({ plain: true });

    console.log("Stuent", student);
    const coordi = JSON.parse(JSON.stringify(student?.coordinate)).coordinates;

    const searchRet = await client.index("request").search("", {
        filter: [`_geoRadius(${coordi[0]}, ${coordi[1]}, 1000000000)`],
    });

    return searchRet;
};
