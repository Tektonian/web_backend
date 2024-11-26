import RequestInfo from "../models/requestInfo";
export const createRequestInfo = async (req, res) => {
    const requestInfo = await RequestInfo.create(req.body);
    res.json(requestInfo);
};
export const getAllRequestInfo = async (req, res) => {
    const requestInfos = await RequestInfo.findAll();
    res.json(requestInfos);
};
export const getRequestInfoById = async (req, res) => {
    const requestInfo = await RequestInfo.findByPk(req.params.id);
    if (!requestInfo) {
        res.json({ error: "Request info not found" });
        return;
    }
    res.json(requestInfo);
};
export const updateRequestInfo = async (req, res) => {
    const requestInfo = await RequestInfo.findByPk(req.params.id);
    if (!requestInfo) {
        res.json({ error: "Request info not found" });
        return;
    }
    await requestInfo.update(req.body);
    res.json(requestInfo);
};
export const deleteRequestInfo = async (req, res) => {
    const requestInfo = await RequestInfo.findByPk(req.params.id);
    if (!requestInfo) {
        res.json({ error: "Request info not found" });
        return;
    }
    await requestInfo.destroy();
    res.json({ message: "Request info deleted successfully" });
};
