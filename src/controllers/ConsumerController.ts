import { Consumer } from "../models/rdbms/Consumer";
import { Corporation } from "../models/rdbms/Corporation";
import sequelize from "sequelize";
import { Request } from "../models/rdbms/Request";

export const getCorpByCsmId = async (consumer_id: number) => {
    const consumer = await Consumer.findOne({
        where: { consumer_id },
        plain: true,
    });
    const corpId = consumer?.dataValues.corp_id;

    if (!corpId) {
        console.error("no corpid exists");
        return null;
    }

    const corpProfile = await Corporation.findOne({
        where: { corp_id: corpId },
    });

    return corpProfile;
};

export const getRequestByCsmId = async (consumer_id: number) => {
    const requestBody = await Request.findOne({
        where: { consumer_id: consumer_id },
    });
    return requestBody;
};

export const getConsumerByReqId = async (request_id: number) => {
    const request = await Request.findOne({
        where: { request_id: request_id },
        plain: true,
    });
    const consumer_id = request?.dataValues.consumer_id;

    if (!consumer_id) {
        console.error("no csmid exists");
        return null;
    }

    const consumerProfile = await Consumer.findOne({
        where: { consumer_id: consumer_id },
    });

    return consumerProfile;
};
