import app from "..";
import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import { SchoolSearchScheme } from "@mesh/api_spec/zod";
import { ValidateSchema } from "../utils/validation";

const agent = request.agent(app);

describe("Joi Validation 동작 확인", () => {
    test("Validation 실패시 Throw", () => {
        expect(() => {
            ValidateSchema(SchoolSearchScheme.ReqSearchSchoolScheme, { country_code: 1 });
        }).toThrow();
    });

    test("Validation 성공시 값 return", () => {
        expect(ValidateSchema(SchoolSearchScheme.ReqSearchSchoolScheme, { country_code: "KO" })).toEqual({
            country_code: "KO",
        });
    });
});
