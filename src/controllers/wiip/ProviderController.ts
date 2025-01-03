import { Provider } from "../../models/rdbms/Provider";

export const getProvidersByRequest = async (requestId: number) => {
    const providers = await Provider.findAll({ where: { request_id: requestId } });
    return providers;
};
