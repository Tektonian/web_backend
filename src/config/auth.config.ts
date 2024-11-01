import type { ExpressAuthConfig } from "@auth/express";
import { skipCSRFCheck } from "@auth/core";
import Credential from "@auth/express/providers/credentials";
import Google from "@auth/express/providers/google";
import Nodemailer from "@auth/express/providers/nodemailer";
import { Sequelize, DataTypes } from "sequelize";
import { models } from "../models";
import dotenv from "dotenv";
import SequelizeAdapter from "./auth.adapter-sequelize";
dotenv.config({ path: ".env.local" });

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
        dialect: "mysql",
    },
);

// Most of the codes are from https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/lib/actions/callback/handle-login.ts#L26
// Since there is no proper handler for credential Login or Signin(Register)
// We need handle Data by ourselves
// TOOD: Right now we choose to use "JWT" tactic instead of database session
// See github issue: https://github.com/nextauthjs/next-auth/issues/11088

import { createTransport } from "nodemailer";

export async function customSendVerificationRequest(params) {
    console.log("Custom email", params);
    const { identifier, token, url, provider, theme } = params;
    const { host } = new URL(url);
    // NOTE: You are not required to use `nodemailer`, use whatever you want.
    const transport = createTransport(provider.server);
    const result = await transport.sendMail({
        to: identifier,
        from: provider.from,
        subject: `Sign in to ${host}`,
        text: text({ url, host }),
        html: html({ url, host, theme, token }),
    });
    const failed = result.rejected.concat(result.pending).filter(Boolean);
    if (failed.length) {
        throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
    }
}

function html(params: {
    url: string;
    host: string;
    theme: Theme;
    token: string;
}) {
    const { url, host, theme, token } = params;

    const escapedHost = host.replace(/\./g, "&#8203;.");

    const brandColor = theme.brandColor || "#346df1";
    const color = {
        background: "#f9f9f9",
        text: "#444",
        mainBackground: "#fff",
        buttonBackground: brandColor,
        buttonBorder: brandColor,
        buttonText: theme.buttonText || "#fff",
    };

    return `
<body style="background: ${color.background};">
  <table width="100%" border="0" cellspacing="20" cellpadding="0"
    style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Sign in to <strong>${escapedHost}</strong>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center"
                style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
                Input <strong>${token}</strong>
            </td>            
            <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                target="_blank"
                style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Sign
                in</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center"
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        If you did not request this email you can safely ignore it.
      </td>
    </tr>
  </table>
</body>
`;
}

// Email Text body (fallback for email clients that don't render HTML, e.g. feature phones)
function text({ url, host }: { url: string; host: string }) {
    return `Sign in to ${host}\n${url}\n\n`;
}

const emailProvider = Nodemailer({
    server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
        },
    },
    from: process.env.EMAIL_FROM,
    sendVerificationRequest: customSendVerificationRequest,
});

export const authConfig: ExpressAuthConfig = {
    adapter: SequelizeAdapter(sequelize),
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
            sendVerificationRequest: customSendVerificationRequest,
            generateVerificationToken: () => {
                return crypto.randomUUID();
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
        },
        async session({ session, token, user }) {
            console.log("Session", session, token, user);
            // Pass JWT token info to session
            // https://authjs.dev/guides/extending-the-session#with-jwt
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
