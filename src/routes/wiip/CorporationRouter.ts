import express, { Request, Response } from "express";
import { Consumer } from "../../models/rdbms/Consumer";
import { Corporation } from "../../models/rdbms/Corporation";
import * as CorpController from "../../global/corpInfo/kr/CorpInfoController";

/**
 * Types, middleware, and validator
 */
import { filterSessionByRBAC } from "../../middleware/auth.middleware";
import { CorporationSchema } from "api_spec/joi";
import { ValidateSchema } from "../../utils/validation.joi";
import { APISpec } from "api_spec";

/**
 * Utils
 */
import { pick } from "es-toolkit";
import * as Errors from "../../errors";
import logger from "../../utils/logger";

const CorporationRouter = express.Router();

/**
 * @deprecated
 */
CorporationRouter.get("/", async (req: Request, res: Response) => {
    try {
        const consumer_id = req.query.consumer_id;
        const consumer = await Consumer.findOne({
            where: { consumer_id },
            attributes: ["corp_id"],
        });

        const corporation = consumer
            ? await Corporation.findOne({
                  where: { corp_id: consumer.dataValues.corp_id },
              })
            : null;

        res.json(corporation?.dataValues);
        console.log(corporation?.dataValues);
    } catch (err) {
        console.error(err);
    }
});

/**
 * @deprecated
 */
CorporationRouter.get("/corpProfile", async (req: Request, res: Response) => {
    const corpNum = req.query.corpNum;

    const storedCorpProfile = await CorpController.findCorpProfileByCorpNum(Number(corpNum));

    if (storedCorpProfile === undefined) {
        const externCorpProfile = await CorpController.externReqCorpProfile(Number(corpNum));

        if (externCorpProfile === undefined) {
            res.json({ status: "Extern API error", profile: undefined });
        }

        res.json({ status: "not exist", profile: externCorpProfile });
    } else {
        res.json({ status: "exist", profile: storedCorpProfile });
    }
});

CorporationRouter.post(
    "/" satisfies keyof APISpec.CorporationAPISpec,
    // Logined and validated
    filterSessionByRBAC(["normal"]),
    (async (req, res) => {
        logger.info("START-Create corporation profile");
        const corpData = ValidateSchema(CorporationSchema.ReqCreateCorpProfileSchema, req.body);

        const createdCorpProfile = await CorpController.createCorpProfile(corpData);

        res.status(200).json({ corp_id: String(createdCorpProfile.corp_id) });
        logger.info("END-Create corporation profile");
    }) as APISpec.CorporationAPISpec["/"]["post"]["handler"],
);

CorporationRouter.get("/:corp_id" satisfies keyof APISpec.CorporationAPISpec, (async (req, res) => {
    logger.info("START-Get Corporation profile");
    const corpId: number | string | undefined = req.params.corp_id;

    if (!corpId) {
        throw new Errors.ServiceExceptionBase(`User requested wrong corporation id: ${corpId}`);
    }
    const corpProfile = (await CorpController.findCorpProfileByCorpId(Number(corpId)))?.get({ plain: true });

    if (!corpProfile) {
        throw new Errors.ServiceExceptionBase(`User requested wrong corporation id: ${corpId}`);
    }
    res.json(
        pick(corpProfile, [
            "corp_id",
            "corp_name",
            "nationality",
            "ceo_name",
            "corp_address",
            "biz_type",
            "logo_image",
            "site_url",
            "corp_domain",
            "phone_number",
        ]),
    );
    logger.info("END-Get Corporation profile");
}) as APISpec.CorporationAPISpec["/:corp_id"]["get"]["handler"]);

export default CorporationRouter;
