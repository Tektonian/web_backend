import express, { Request, Response } from "express";
import { Consumer } from "../models/rdbms/Consumer";
import { Corporation } from "../models/rdbms/Corporation";

const ConsumerRouter = express.Router();

ConsumerRouter.get("/:consumer_id", async (req: Request, res: Response) => {
    try {
        const consumer_id = req.params.consumer_id;
        const consumer = await Consumer.findOne({
            where: { consumer_id },
        });

        res.json(consumer);
    } catch (err) {
        console.error(err);
    }
});

ConsumerRouter.post("/", async (req: Request, res: Response) => {
    try {
        const consumer = await Consumer.create({
            user_id: req.body.user_id,
            corp_id: req.body.corp_id,
            orgn_id: req.body.orgn_id,
            consumer_type: req.body.consumer_type,
            consumer_email: req.body.consumer_email,
            consumer_verified: req.body.consumer_verified,
            phone_number: req.body.phone_number,
            created_at: req.body.created_at,
            updated_at: req.body.updated_at,
        });
        console.log(consumer);
        res.json(consumer);
    } catch (error) {
        console.error(error);
    }
});

export default ConsumerRouter;
