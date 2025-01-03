import app from "../..";
import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import { Request } from "../../models/rdbms/Request";
import { Organization } from "../../models/rdbms/Organization";
import { Corporation } from "../../models/rdbms/Corporation";
import { StudentReview } from "../../models/rdbms/StudentReview";
import { Provider } from "../../models/rdbms/Provider";

import { RequestEnum } from "api_spec/enum";
import { Op } from "sequelize";

const corpAgent = request.agent(app);
const normalAgent = request.agent(app);
beforeAll(async () => {
    // 로그인
    // Login first

    await corpAgent.post("/api/auth/callback/credentials").send({ email: "corp0@test.com", csrfToken: "" });
    await normalAgent.post("/api/auth/callback/credentials").send({ email: "test0@test.com", csrfToken: "" });
});

describe("Student review 데이터 획득 요청", () => {
    test("기업 유저의 학생 리뷰 획득 - 일반 유저와 달리 다른 기업이 작성한 리뷰 획득 여부 확인", async () => {
        const studentReviews = await StudentReview.findAll({ raw: true });

        expect(studentReviews.length).toBeGreaterThanOrEqual(0);
        const completedCorpRequest = await Request.findAll({
            where: { request_id: { [Op.in]: studentReviews.map((val) => val.request_id) } },
            raw: true,
        });

        expect(completedCorpRequest.length).toBeGreaterThanOrEqual(0);

        const firstReview = studentReviews.at(0);
        console.log(firstReview);
        const corpRes = await corpAgent.get(`/api/student-reviews/list/${firstReview?.student_id}`);
        console.log(corpRes.body);

        expect(corpRes.body.find((val) => val.praise === firstReview?.praise)).toBeDefined();

        const normalRes = await normalAgent.get(`/api/student-reviews/list/${firstReview?.student_id}`);
        console.log(normalRes.body);

        expect(normalRes.body.find((val) => val.praise === firstReview?.praise)).toBeUndefined();
    });
});
