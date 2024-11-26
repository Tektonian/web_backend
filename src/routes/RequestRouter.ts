import express, { Request, Response } from "express";
import { Request as RequestModel } from "../models/rdbms/Request";

const RequestRouter = express.Router();

RequestRouter.get("/:request_id", async (req: Request, res: Response) => {
    try {
        const request_id = req.params.request_id;
        const rq = await RequestModel.findOne({ where: { request_id } });
        res.json(rq);
    } catch (err) {
        console.error(err);
    }
});

RequestRouter.post("/", async (req: Request, res: Response) => {
    try {
        const requests = await RequestModel.create({
            request_id: req.body.request_id,
            consumer_id: req.body.consumer_id,
            title: req.body.title,
            subtitle: req.body.subtitle,
            head_count: req.body.head_count,
            reward_price: req.body.reward_price,
            currency: req.body.currency,
            content: req.body.content,
            are_needed: req.body.are_needed,
            are_required: req.body.are_required,
            start_date: req.body.start_date,
            end_date: req.body.start_date,
            address: req.body.address,
            address_coordinate: req.body.address_coordinate,
            provide_food: req.body.provide_food,
            provide_trans_exp: req.body.provide_trans_exp,
            prep_material: req.body.prep_material,
            status: req.body.status,
            start_time: req.body.start_time,
            end_time: req.body.end_time,
            created_at: req.body.created_at,
            updated_at: req.body.updated_at,
            corp_id: req.body.corp_id,
            orgn_id: req.body.orgn_id,
        });
        console.log(requests);
        res.status(201).json(requests);
    } catch (err) {
        console.error(err);
    }
});

export default RequestRouter;
