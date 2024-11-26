import express, { Request, Response } from "express";
import { Consumer } from "../models/rdbms/Consumer";
import { Corporation } from "../models/rdbms/Corporation";

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

export default CorporationRouter;
