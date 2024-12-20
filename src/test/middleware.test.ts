import app from "..";

import { describe, test, expect, beforeAll } from "vitest";
import { currentSession, filterSessionByRBAC } from "../middleware/auth.middleware";
import { User } from "../models/rdbms/User";
import request from "supertest";

const agent = request.agent(app);

beforeAll(async () => {
    // Login first
    await agent.post("/api/auth/callback/credentials").send({ email: "test0@test.com", csrfToken: "" });
});

describe("currentSession 미들웨어 테스트", () => {
    test("로그인된 유저 정보 res 추가하는지 확인", async () => {
        // 아무 API 호출해서 request 데이터 필드 획득
        const req = await (await agent.withCredentials(true).get("/api/requests/1")).request.req;
        const test0 = await User.findOne({ where: { username: "test0" }, raw: true });
        // Request 타입과 비슷하게 조정
        const mockReq = {
            ...req,
            headers: {
                cookie: req.getHeader("cookie"),
            },
        };
        const mockRes = {
            session: undefined,
        };
        await currentSession(mockReq, mockRes, () => 1);
        return expect(mockRes.session).toEqual({
            user: {
                name: test0?.username,
                email: test0?.email,
                image: test0?.image,
                id: test0?.user_id,
                roles: test0?.roles,
            },
        });
    });

    test("미로그인 유저 정보 res 추가하는지 확인", async () => {
        // 아무 API 호출해서 request 데이터 필드 획득
        const req = (await request(app).get("/api/requests/1")).request.req;
        // Request 타입과 비슷하게 조정
        const mockReq = {
            ...req,
            headers: {
                cookie: req.getHeader("cookie"),
            },
        };
        const mockRes = {
            session: undefined,
        };
        await currentSession(mockReq, mockRes, () => 1);
        return expect(mockRes.session).toEqual(undefined);
    });
});

describe("filterSessionByRBAC 미들웨어 테스트", () => {
    test("roles 에 들어있는 경우", async () => {
        const req = await (await agent.withCredentials(true).get("/api/requests/1")).request.req;
        // Request 타입과 비슷하게 조정
        const mockReq = {
            ...req,
            headers: {
                cookie: req.getHeader("cookie"),
            },
        };
        const mockRes = {
            session: undefined,
        };
        // 세션 정보 입력
        await currentSession(mockReq, mockRes, () => 1);
        // 미들 웨어 테스트. 정상인 경우 1 반환
        const ret = await (await filterSessionByRBAC(["normal"]))(mockReq, mockRes, () => 1);
        return expect(ret).toEqual(1);
    });
    test("roles 에 djqt 경우", async () => {
        // 아무 API 호출해서 request 데이터 필드 획득
        const req = await (await agent.withCredentials(true).get("/api/requests/1")).request.req;
        // Request 타입과 비슷하게 조정
        const mockReq = {
            ...req,
            headers: {
                cookie: req.getHeader("cookie"),
            },
        };
        const mockRes = {
            session: undefined,
        };
        // 세션 정보 입력
        await currentSession(mockReq, mockRes, () => 1);
        // 미들 웨어 테스트. 비정상인 경우 undefined 반환
        const ret = await (await filterSessionByRBAC(["corp"]))(mockReq, mockRes, () => 1);
        return expect(ret).toEqual(undefined);
    });
});
