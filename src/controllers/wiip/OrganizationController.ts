import { models } from "../../models/rdbms";

const Organization = models.Organization;
const Consumer = models.Consumer;

export const getOrgnByOrgnId = async (orgnId: number) => {
    return await Organization.findOne({ where: { orgn_id: orgnId } });
};

export const getOrgnByConsumerId = async (consumer_id: number) => {
    const consumer = await Consumer.findOne({
        where: { consumer_id },
        plain: true,
    });
    const orgnId = consumer?.dataValues.orgn_id;

    if (!orgnId) {
        console.error("no corpid exists");
        return null;
    }

    const orgnProfile = await Organization.findOne({
        where: { orgn_id: orgnId },
    });

    return orgnProfile;
};

export const checkUserIsOrgnWorker = async (userId: Buffer, orgnId: number) => {
    const consumers = await Consumer.findAll({ where: { user_id: userId }, raw: true });

    const isWorker = consumers.find((val) => val.orgn_id === orgnId);

    return isWorker;
};
