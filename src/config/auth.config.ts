import type { ExpressAuthConfig } from "@auth/express";
import { skipCSRFCheck } from "@auth/core";
import Google from "@auth/express/providers/google";
import Naver from "@auth/express/providers/naver";
import Kakao from "@auth/express/providers/kakao";
import Nodemailer from "@auth/express/providers/nodemailer";
import { sequelize } from "../models/rdbms/index.js";
import SequelizeAdapter from "./auth.adapter-sequelize.js";

import logger from "../utils/logger.js";

/**
 * Most of the codes are from https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/lib/actions/callback/handle-login.ts#L26
 * Since there is no proper handler for credential Login or Signin(Register)
 * We need handle Data by ourselves
 * TOOD: Right now we choose to use "JWT" tactic instead of database session
 * @see {@link github issue: https://github.com/nextauthjs/next-auth/issues/1108}
 */

import { createTransport } from "nodemailer";
import Credentials from "@auth/core/providers/credentials";

export async function customSendVerificationRequest(params) {
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

function html(params: { url: string; host: string; theme: Theme; token: string }) {
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

export const authConfig: ExpressAuthConfig = {
    adapter: SequelizeAdapter(sequelize),
    session: { strategy: "jwt" },
    providers:
        process.env.NODE_ENV !== "production"
            ? [
                  Google,
                  Nodemailer({
                      server: {
                          host: process.env.EMAIL_SERVER_HOST,
                          port: Number(process.env.EMAIL_SERVER_PORT),
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
                  Credentials({
                      credentials: {
                          email: {},
                      },
                      authorize: async (credentials) => {
                          const adapter = SequelizeAdapter(sequelize);
                          const userInstance = await adapter.getUserByEmail(credentials.email);
                          logger.debug(`User credential authorization: ${userInstance}`);
                          return userInstance;
                      },
                  }),
              ]
            : [
                  Google,
                  Naver,
                  Kakao,
                  Nodemailer({
                      server: {
                          host: process.env.EMAIL_SERVER_HOST,
                          port: Number(process.env.EMAIL_SERVER_PORT),
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

    skipCSRFCheck: process.env.NODE_ENV !== "production" ? skipCSRFCheck : undefined, // TODO: remove later
    callbacks: {
        /**
         *
         * @param token: When trigger is "signIn" or "signUp", it will be a subset of JWT,
                        name, email and image will be included.
                        Otherwise, it will be the full JWT for subsequent calls.
         * @param session: When using AuthConfig.session strategy: "jwt", this is the data
                            sent from the client via the useSession().update method.
                            ⚠ Note, you should validate this data before using it.
         * @param User
         * @param trigger
         * @param account
         * @param profile
         */
        async jwt({ token, user, trigger, account, profile, session }) {
            /*console.log(
                "JWT: ",
                token,
                user,
                trigger,
                account,
                profile,
                session,
            );
            */
            /**
                - user sign-in: First time the callback is invoked, user, profile and account will be present.
                - user sign-up: a user is created for the first time in the database (when AuthConfig.session.strategy is set to "database")
                - update event: Triggered by the useSession().update method.

             */
            logger.debug(
                `jwt: ${process.env.NODE_ENV} ${JSON.stringify(token)}, ${JSON.stringify(user)}, ${JSON.stringify(trigger)}, ${JSON.stringify(account)}, ${JSON.stringify(profile)}, ${JSON.stringify(session)}`,
            );
            if (trigger === "update" || trigger === "signIn" || trigger === "signUp") {
                const adapter = SequelizeAdapter(sequelize);
                const userInstance = await adapter.getUserByEmail(token.email);

                token.id = userInstance?.id;
                token.email = userInstance?.email;
                token.name = userInstance?.username;
                token.roles = userInstance?.roles;
            }
            return token;
        },
        async signIn({ user, account, profile, email, credentials }) {
            const adapter = SequelizeAdapter(sequelize) ?? undefined;

            // ALERT: For development environment
            if (account !== null && account.provider === "credentials") return true;

            // console.log(user, account, profile, email);
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
            // Pass JWT token info to session
            // https://authjs.dev/guides/extending-the-session#with-jwt
            // console.log("Session: ", session, token, user);
            logger.debug(`Session: ${JSON.stringify(session)} - ${JSON.stringify(token)} - ${user}`);
            // IMPORTANT: User id should not be exposed
            // session.user.id = token.id ?? undefined;

            session.user.email = token.email ?? undefined;
            session.user.name = token.name;
            session.user.roles = token.roles ?? [];
            return session;
        },
    },
    events: {
        async signIn({ user, account, profile, isNewUser }) {
            // console.log("Event signin", user, account, profile, isNewUser);
        },
        async session({ session, token }) {
            // console.log("event session", session, token);
        },
    },
    logger: {
        error(code, ...message) {
            logger.error(`${code}:${message}`);
        },
        warn(code, ...message) {
            logger.warn(`${code}:${message}`);
        },
        debug(code, ...message) {
            logger.debug(`${code}:${message}`);
        },
    },
};
