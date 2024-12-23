import app from "..";
import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import { SchoolSearchScheme } from "api_spec/joi";
import { ValidateSchema } from "../utils/validation.joi";

const agent = request.agent(app);

describe("Joi Validation 동작 확인", () => {
    test("Validation 실패시 Throw", () => {
        expect(() => {
            ValidateSchema(SchoolSearchScheme.ReqSearchSchoolScheme, { country_code: 1 });
        }).toThrow();
    });

    test("Validation 성공시 값 return", () => {
        expect(ValidateSchema(SchoolSearchScheme.ReqSearchSchoolScheme, { country_code: "kr" })).toEqual({
            country_code: "kr",
        });
    });
});
