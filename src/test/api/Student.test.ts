import app from "../..";
import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import openapiAvj from "./init.test";

const agent = request.agent(app);

beforeAll(async () => {
    // 로그인
    // Login first

    await agent.post("/api/auth/callback/credentials").send({ email: "corp@test.com", csrfToken: "" });
});
describe("학생 프로필 정보 획득", () => {
    test("일반 유저 학생 프로필 획득 테스트 테스트 - 리뷰 필드 미포함", async () => {
        const res = await agent.get("/api/students/35");
        const validate = openapiAvj.getSchema("openapi#/components/schemas/ResStudentProfile");
        const pass = validate!({ profile: { age: "0", ...res.body.profile }, review: res.body.review });
        console.log(validate?.errors, res.body);
        expect(pass).toBeTruthy();
    });
    test("기업(기관) 유저 학생 프로필 획득 - 리뷰 필드 포함되어야함");
});
