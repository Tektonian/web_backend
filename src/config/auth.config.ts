import type { ExpressAuthConfig } from "@auth/express";
import { skipCSRFCheck } from "@auth/core";
import Credential from "@auth/express/providers/credentials";
import Google from "@auth/express/providers/google";
import Nodemailer from "@auth/express/providers/nodemailer";
import SequelizeAdapter from "@auth/sequelize-adapter";
import { Sequelize, DataTypes } from "sequelize";
import { models } from "../models";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sequelize = new Sequelize("tektonian", "root", "gang1234", {
    dialect: "mysql",
});

// Most of the codes are from https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/lib/actions/callback/handle-login.ts#L26
// Since there is no proper handler for credential Login or Signin(Register)
// We need handle Data by ourselves
// TOOD: Right now we choose to use "JWT" tactic instead of database session
// See github issue: https://github.com/nextauthjs/next-auth/issues/11088
const handleCredentialLoginOrRegister = ({
    user,
    account,
    profile,
    isNewUser,
}: any) => {
    if (account.provider !== "credentials") {
        throw new Error("Provider not supported");
    }

    const adapter = DrizzleAdapter(db);

    if (adapter === null) {
        throw new Error("No database connected");
    }
};

export const authConfig: ExpressAuthConfig = {
    adapter: SequelizeAdapter(sequelize, {
        models: {
            User: sequelize.define("user", {
                ...models.User.schema,
                password: DataTypes.STRING,
                salt: DataTypes.STRING,
            }),
        },
    }),
    session: { strategy: "jwt" },
    providers: [
        Google,
        Nodemailer({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: process.env.EMAIL_SERVER_PORT,
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
        }),
        Credential({
            credentials: {
                email: {},
                passwd: {},
            },
            // next is signIn callback
            // @ts-ignore
            authorize: async (credentials) => {
                console.log("Authorize: ", credentials);
                let user = null;

                const password = credentials.passwd ?? "";
                const email = credentials?.email;
                user = await models.User.findOne({
                    where: { email: credentials.email },
                    attributes: ["user_id", "username", "email"],
                });
                console.log("USER", user);
                // @ts-ignore
                if (!user) {
                    return user.dataValues;
                    throw new Error("User not found");
                }

                return user.dataValues;
            },
        }),
    ],

    skipCSRFCheck: skipCSRFCheck, // TODO: remove later
    callbacks: {
        async jwt({ token, user, trigger, account, profile, session }) {
            console.log(
                "JWT: ",
                token,
                user,
                trigger,
                account,
                profile,
                session,
            );
            if (trigger === "update") token.name = session.user.name;
            token.id = user?.id ?? token.id;
            return token;
        },
        async signIn({ user, account, profile, email, credentials }) {
            const adapter = SequelizeAdapter(sequelize) ?? undefined;
            console.log(
                "User signing",
                user,
                account,
                profile,
                email,
                credentials,
            );

            // Google Oauth2
            if (account !== null && account.provider === "google") {
                return profile?.email_verified;
            }
            if (account !== null && account.provider === "nodemailer") {
                // 메일 전송 요청
                if (email?.verificationRequest) {
                    return email?.verificationRequest;
                    // 메일 인증 완료
                } else {
                    return true;
                }
            }
            if (account !== null && account.type === "credentials") {
                return true;
                // @ts-ignore
                const emailVerified = await adapter.getAccount(
                    // @ts-ignore
                    account.providerAccountId,
                );
            }
            console.log(
                "User signin2: ",
                user,
                account,
                profile,
                email,
                credentials,
            );

            if (
                credentials === undefined ||
                credentials.email === undefined ||
                credentials.email === null
            )
                return false;

            // @ts-ignore
            return credentials.email.endsWith(".com");
        },
        async session({ session, token, user }) {
            console.log("Session", session, token, user);
            //session.sessionToken = token.accessToken;
            //session.user.id = token.id;
            session.user.id = token.id;
            return session;
        },
    },
    events: {
        async signIn({ user, account, profile, isNewUser }) {
            console.log("Event signin", user, account, profile, isNewUser);
        },
        async session({ session, token }) {
            console.log("event session", session, token);
        },
    },
    debug: true,
};
