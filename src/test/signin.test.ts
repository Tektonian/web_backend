import app from "..";

import { describe, test, expect, afterAll } from "vitest";
import request from "supertest";

import { models } from "../models/rdbms";

const User = models.User;
const VerificationToken = models.VerificationToken;
const Consumer = models.Consumer;

const agent = request.agent(app);

const USER_EMAIL = "signinuser@test.com";

describe("회원가입 시도", () => {
    test("이메일을 통한 회원 가입 시도: 1-이메일 주소 전송", async () => {
        // Try send email
        await agent.post("/api/auth/signin/nodemailer").send({ email: USER_EMAIL, csrfToken: "" });

        // Check verification token has been created;
        const token = await VerificationToken.findOne({ where: { identifier: USER_EMAIL }, raw: true });

        expect(token === null, "Token should exist").toBeFalsy();
    });

    test("이메일을 통한 회원 가입 시도: 1.1-토큰 정보 확인", async () => {
        // Check verification token has been created;
        const token = await VerificationToken.findOne({ where: { identifier: USER_EMAIL }, raw: true });

        expect(token!.token_type, "Token type should email when signin").toEqual("email");
    });

    test("이메일을 통한 회원 가입 시도: 2-토큰을 통한 인증", async () => {
        // Example url
        // api/auth/callback/nodemailer?callbackUrl=http%3A%2F%2Flocalhost%3A8080&token=b6eef68d-e446-44ab-b780-c2fc1fdfce1c&email=gangjeuk%40gmail.com

        const token = await VerificationToken.findOne({ where: { identifier: USER_EMAIL }, raw: true });
        console.log(token);

        // We will replace token value for testing
        // token creation code can be found at https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/lib/utils/web.ts#L100
        const newUUID = crypto.randomUUID();
        const secret = process.env.AUTH_SECRET;
        const data = new TextEncoder().encode(`${newUUID}${secret}`);
        const hash = await crypto.subtle.digest("SHA-256", data);

        const newToken = Array.from(new Uint8Array(hash))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")
            .toString();

        await VerificationToken.update({ token: newToken }, { where: { token: token!.token } });
        // And we will request verification with replaced token
        const params = new URLSearchParams({
            callbackUrl: "http://localhost:8080",
            token: newUUID,
            email: USER_EMAIL,
        });

        const getUrl = "/api/auth/callback/nodemailer?" + params.toString();
        console.log(getUrl);
        await agent.get(getUrl);

        // If verification succeeded token should be deleted
        const deletedToken = await VerificationToken.findOne({ where: { token: newToken }, raw: true });

        expect(deletedToken).toBeNull();
    });

    test("이메일을 통한 회원 가입 시도: 2.1-생성된 유저 이메일 확인", async () => {
        // Check verification token has been created;
        const user = await User.findOne({ where: { email: USER_EMAIL }, raw: true });

        expect(user?.email).toEqual(USER_EMAIL);
    });
    test("이메일을 통한 회원 가입 시도: 2.2-생성된 유저 Consumer identity 확인", async () => {
        // Check verification token has been created;
        const consumer = await Consumer.findOne({ where: { consumer_email: USER_EMAIL }, raw: true });

        expect(consumer === undefined).toBeFalsy();
        expect(consumer?.consumer_email).toEqual(USER_EMAIL);
        // Email should be verified
        expect(consumer?.consumer_verified === undefined).toBeFalsy();
        // Default consumer identity should be 'normal' type
        expect(consumer?.consumer_type).toEqual("normal");
    });
});

afterAll(async () => {
    await User.destroy({ where: { email: USER_EMAIL } });
    await VerificationToken.destroy({ where: {} });
});
