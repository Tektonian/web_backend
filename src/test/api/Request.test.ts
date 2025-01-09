import app from "../..";
import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import { models } from "../../models/rdbms";
import { RequestEnum } from "api_spec/enum";

const Request = models.Request;
const Organization = models.Organization;
const Corporation = models.Corporation;
const Provider = models.Provider;

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
        const dummy = {
            data: {
                title: "신재생에너지 사업 개발부문, 관리부문 직원 채용",
                head_count: 2,
                reward_price: 21712,
                currency: "JP",
                content: "신재생에너지 사업 개발부문, 관리부문 직원 채용",
                are_needed: ["you", "body", "head"],
                are_required: ["inner", "peace"],
                start_date: "2024-12-04",
                end_date: "2024-12-04",
                address: "Kitakyushu, Fukuoka Prefecture, Japan",
                address_coordinate: { lat: 33.883331, lng: 130.883331 },
                provide_food: true,
                provide_trans_exp: true,
                prep_material: ["shose", "bike", "car"],
                start_time: "20:27:25",
                end_time: "01:27:25",
            },
            role: "corp",
        };
        const res = await corpAgent.post("/api/requests").send(dummy);

        if (res.statusCode === 200) {
            await Request.destroy({ where: { request_id: res.body.request_id } });
        }
        expect(res.statusCode).toEqual(200);
        expect(res.body.request_id).toBeDefined();
    });
});
