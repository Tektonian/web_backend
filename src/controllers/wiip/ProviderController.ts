import { Op } from "sequelize";
import { models } from "../../models/rdbms";

const Provider = models.Provider;

export const getProvidersByRequest = async (requestId: number) => {
    const providers = await Provider.findAll({ where: { request_id: requestId } });
    return providers;
};

export const getProviderOfRequestByStudentId = async (requestId: number, studentId: number) => {
    const provider = await Provider.findOne({
        where: { [Op.and]: [{ request_id: requestId }, { student_id: studentId }] },
    });

    return provider;
};
