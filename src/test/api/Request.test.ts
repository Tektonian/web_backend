import app from "../..";
import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import { Request } from "../../models/rdbms/Request";
import { Organization } from "../../models/rdbms/Organization";
import { Corporation } from "../../models/rdbms/Corporation";
import { Provider } from "../../models/rdbms/Provider";

import { RequestEnum } from "api_spec/enum";
const corpAgent = request.agent(app);
beforeAll(async () => {
    // 로그인
    // Login first

    const orgn = (await Organization.findAll({ raw: true })).at(0);
    const corp = (await Corporation.findAll({ raw: true })).at(0);

    await corpAgent.post("/api/auth/callback/credentials").send({ email: "corp0@test.com", csrfToken: "" });
});

describe("Request card 획득 요청", () => {
    test("기업 유저의 학생 리퀘스트 획득 - Finished 상태 리퀘스트 획득 가능해야함", async () => {
        const completedRequest = (await Request.findAll({ raw: true })).find(
            (req) => req.request_status === RequestEnum.REQUEST_STATUS_ENUM.FINISHED,
        );

        expect(completedRequest).toBeDefined();
        const provider = (
            await Provider.findAll({ where: { request_id: completedRequest?.request_id }, raw: true })
        ).at(0);

        expect(provider).toBeDefined();

        const res = await corpAgent.post("/api/requests/list/student").send({ student_id: provider?.student_id });

        const resRequst = res.body.requests.find((req) => req.request_id === completedRequest?.request_id);
        expect(resRequst.request_id === completedRequest?.request_id).toBeTruthy();
    });
});

describe("Request Post 요청", () => {
    test("기업 유저의 Request Post 요청", async () => {
        const completedRequest = (await Request.findAll({ raw: true })).find(
            (req) => req.request_status === RequestEnum.REQUEST_STATUS_ENUM.FINISHED,
        );

        expect(completedRequest).toBeDefined();
        const address_coordinate = completedRequest?.address_coordinate;

        console.log(completedRequest);
        completedRequest!.address_coordinate = {
            lat: address_coordinate.coordinates[0],
            lng: address_coordinate.coordinates[1],
        };
        completedRequest!.request_id = null;
        completedRequest!.provide_food = true;
        completedRequest!.provide_trans_exp = true;
        const res = await corpAgent.post("/api/requests/").send({ data: completedRequest, role: "corp" });
        expect(res.statusCode).toEqual(200);
        const request_id = res.body.request_id;
        await Request.destroy({ where: { request_id: request_id } });
    });
});
