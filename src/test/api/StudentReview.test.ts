import app from "../..";
import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import { models } from "../../models/rdbms";
import { omit } from "es-toolkit";
import { Op } from "sequelize";

const Request = models.Request;
const StudentReview = models.StudentReview;
const Consumer = models.Consumer;
const User = models.User;

const corpAgent = request.agent(app);
const normalAgent = request.agent(app);
beforeAll(async () => {
    const studentReview = (await StudentReview.findAll({ raw: true })).find((val) => val.corp_id !== undefined);
    const consumer = await Consumer.findOne({ where: { consumer_id: studentReview?.consumer_id }, raw: true });
    const user = await User.findOne({ where: { user_id: consumer?.user_id }, raw: true });
    // 로그인
    // Login first
    await corpAgent.post("/api/auth/callback/credentials").send({ email: `${user?.email}`, csrfToken: "" });
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
        const corpRes = await corpAgent.get(`/api/student-reviews/list/${firstReview?.student_id}`);

        expect(corpRes.body.find((val) => val.praise === firstReview?.praise)).toBeDefined();

        const normalRes = await normalAgent.get(`/api/student-reviews/list/${firstReview?.student_id}`);

        expect(normalRes.body.find((val) => val.praise === firstReview?.praise)).toBeUndefined();
    });
});

describe("Student Review 작성", () => {
    test("학생 리뷰 작성", async () => {
        const studentReview = (await StudentReview.findAll({ raw: true })).find((val) => val.corp_id !== undefined);

        expect(studentReview).toBeDefined();

        await StudentReview.destroy({ where: { id: studentReview!.id } });

        const completedCorpRequest = await Request.findAll({
            where: { request_id: studentReview?.request_id },
            raw: true,
        });

        expect(completedCorpRequest.length).toBeGreaterThanOrEqual(0);

        console.log(studentReview);
        const res = await corpAgent
            .post("/api/student-reviews")
            .send(omit(studentReview!, ["id", "corp_id", "orgn_id", "request_url", "created_at", "updated_at"]));

        expect(res.statusCode).toEqual(200);

        const newReview = (await StudentReview.findAll({ order: [["created_at", "DESC"]] }))
            .at(0)
            ?.get({ plain: true });
        if (res.statusCode !== 200) {
            await StudentReview.create(studentReview);
        }

        expect(newReview?.consumer_id).toEqual(studentReview?.consumer_id);
        expect(newReview?.student_id).toEqual(studentReview?.student_id);
    });
});
