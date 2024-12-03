import express, { Request, Response } from "express";
import { Consumer } from "../models/rdbms/Consumer";
import { Corporation } from "../models/rdbms/Corporation";
import * as CorpController from "../global/corpInfo/kr/CorpInfoController";

const CorporationRouter = express.Router();

CorporationRouter.get("/:consumer_id", async (req: Request, res: Response) => {
    try {
        const consumer_id = req.params.consumer_id;
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
    const corpNum = req.params.corpNum;

    const storedCorpProfile =
        await CorpController.findCorpProfileByCorpNum(corpNum);

    if (storedCorpProfile === undefined) {
        const externCorpProfile =
            await CorpController.externReqCorpProfile(corpNum);

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

export default CorporationRouter;
