import { Consumer } from "../../models/rdbms/Consumer";
import { Corporation } from "../../models/rdbms/Corporation";

export const getCorpByConsumerId = async (consumer_id: number) => {
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
