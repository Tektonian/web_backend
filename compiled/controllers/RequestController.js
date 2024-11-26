import { Request as RequestData } from "../models/rdbms/Request";
export const CreateRequest = async (req, res) => {
    try {
        const request = await RequestData.create(req.body);
        res.status(201).json(request);
    }
    catch (error) {
        res.status(500);
    }
};
