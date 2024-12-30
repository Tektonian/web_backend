import express, { Request, Response } from "express";
import { Consumer } from "../../models/rdbms/Consumer";
import { Corporation } from "../../models/rdbms/Corporation";
import * as CorpController from "../../global/corpInfo/kr/CorpInfoController";

import { APISpec } from "api_spec";
import {} from "api_spec/enum";
import * as Errors from "../../errors";
import logger from "../../utils/logger";

const CorporationRouter = express.Router();

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

CorporationRouter.post("/corpProfile", async (req: Request, res: Response) => {
    const corpData = req.body;

    const createdCorpProfile = await CorpController.createCorpProfile(corpData);

    res.json(createdCorpProfile);
});

CorporationRouter.get("/:corp_id" satisfies keyof APISpec.CorporationAPISpec, (async (req, res) => {
    logger.info("START-Get Corporation profile");
    const corpId: number | undefined = req.params.corp_id;

    if (!corpId) {
        throw new Errors.ServiceExceptionBase(`User requested wrong corporation id: ${corpId}`);
    }
    const corpProfile = await CorpController.findCorpProfileByCorpId(Number(corpId));

    if (!corpProfile) {
        throw new Errors.ServiceExceptionBase(`User requested wrong corporation id: ${corpId}`);
    }
    res.json({
        corp_id: corpProfile.corp_id,
        corp_name: corpProfile.corp_name,
        nationality: corpProfile.nationality,
        ceo_name: corpProfile.ceo_name,
        biz_type: corpProfile.biz_type,
        logo_image: corpProfile.logo_image,
        site_url: corpProfile.site_url,
        corp_domain: corpProfile.corp_domain,
        phone_number: corpProfile.phone_number,
    });
    logger.info("END-Get Corporation profile");
}) as APISpec.CorporationAPISpec["/:corp_id"]["get"]["handler"]);

export default CorporationRouter;
