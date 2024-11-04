import { Sequelize } from "sequelize";
import { createTransport } from "nodemailer";
import express, { Request, Response } from "express";
import { models } from "../models";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const server = {
    host: process.env.EMAIL_SERVER_HOST,
    port: process.env.EMAIL_SERVER_PORT,
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
};
const verificationRouter = express.Router();

verificationRouter.get("/callback/identity-verify", async (req, res, next) => {
    const { token, email, verifyEmail, type } = req.query;

    if (
        (type !== undefined && !["student", "corp", "orgn"].includes(type)) ||
        email === undefined ||
        verifyEmail === undefined ||
        token === undefined
    ) {
        res.json("Wrong request");
    }

    const userInstance =
        (
            await models.User.findOne({
                where: { email: email },
            })
        )?.get({ plain: true }) ?? null;

    if (userInstance === null) {
        res.json("Wrong user");
    }

    const writtenToken =
        (
            await models.VerificationToken.findOne({
                where: { identifier: verifyEmail },
            })
        ).get({ plain: true }).token ?? null;

    if (writtenToken === null || writtenToken !== token) {
        res.json("Wrong identification");
    }

    if (type === "student") {
        await models.Student.create({
            user_id: userInstance.user_id,
            name_glb: {},
            nationality: "kr",
            age: "",
            phone_number: "",
            emergency_contact: "",
            gender: "",
            email_verified: new Date(),
        });
    } else if (type === "corp") {
        await models.Consumer.create({
            user_id: userInstance.user_id,
            consumer_email: verifyEmail,
            consumer_verified: new Date(),
            consumer_type: "corp",
            phone_number: "",
        });
    } else if (type === "orgn") {
        await models.Consumer.create({
            user_id: userInstance.user_id,
            consumer_email: verifyEmail,
            consumer_verified: new Date(),
            consumer_type: "orgn",
            phone_number: "",
        });
    }

    if (userInstance.roles === null) {
        userInstance.roles = [type];
    } else {
        userInstance.roles = [...userInstance.roles, type];
    }

    await models.User.update(userInstance, { where: { email: email } });

    res.json({ response: "ok" });
});

verificationRouter.post("/identity-verify", async (req, res, next) => {
    const { verifyEmail, type } = req.body;
    const user = res.session?.user ?? null;

    if (user === null) {
        res.json("Login first");
    }

    const userInstance =
        (
            await models.User.findOne({
                where: { email: user.email },
            })
        )?.get({ plain: true }) ?? null;

    if (userInstance === null || userInstance?.email_verified === null) {
        res.json("Verify first");
    }

    const token = crypto.randomUUID();

    await models.VerificationToken.destroy({
        where: { identifier: user.email },
    });

    const createdToken = await models.VerificationToken.create({
        identifier: verifyEmail,
        token: token,
        expires: new Date(Date.now() + 3600 * 1000),
        token_type: type,
    });

    const url = `http://localhost:8080/verification/callback/identity-verify?token=${token}&email=${user.email}&verifyEmail=${verifyEmail}&type=${type}`;
    const { host } = new URL(url);
    // NOTE: You are not required to use `nodemailer`, use whatever you want.
    const transport = createTransport(server);
    const theme = null;
    const result = await transport.sendMail({
        to: verifyEmail,
        from: server.auth.user,
        subject: `Sign in to ${host}`,
        text: text({ url, host }),
        html: html({ url, host, theme, token }),
    });
    const failed = result.rejected.concat(result.pending).filter(Boolean);
    if (failed.length) {
        throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
    }
    res.json("");
});

function html(params: {
    url: string;
    host: string;
    theme: Theme;
    token: string;
}) {
    const { url, host, theme, token } = params;

    const escapedHost = host.replace(/\./g, "&#8203;.");

    const brandColor = theme?.brandColor ?? "#346df1";
    const color = {
        background: "#f9f9f9",
        text: "#444",
        mainBackground: "#fff",
        buttonBackground: brandColor,
        buttonBorder: brandColor,
        buttonText: theme?.buttonText ?? "#fff",
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

export default verificationRouter;
