import { Consumer } from "../../../models/rdbms/Consumer";
import { Corporation } from "../../../models/rdbms/Corporation";

import dotenv from "dotenv";
dotenv.config({ path: "global/.env.local.kr" });

const CORP_API_KEY = process.env.CORP_API_KEY;
const CORP_API_BASE_URL = process.env.CORP_API_BASE_URL;
const CORP_API_END_POINT = "getCorpOutline_V2";

export const externReqCorpProfile = async (corpNum: number) => {
    const getParams = {
        serviceKey: CORP_API_KEY,
        pageNo: 1,
        numOfRows: 10,
        resultType: "json",
        crno: corpNum,
    };
    const getQuery = new URLSearchParams(getParams).toString();
    const getUrl =
        CORP_API_BASE_URL + "/" + CORP_API_END_POINT + "?" + getQuery;

    const externReq = await fetch(getUrl, {
        method: "GET",
    });

    const externJson = await externReq.json();
    if (externJson.data.length === 0) {
        // No such corporation exist
        return undefined;
    }

    return externJson.data;
};

export const createCorpProfile = async (corpProfile) => {
    const createdProfile = (await Corporation.create(corpProfile)).get({
        plain: true,
    });

    return createdProfile;
};

export const findCorpProfileByCorpNum = async (corpNum) => {
    const corpProfile = (
        await Corporation.findOne({ where: { corp_num: corpNum } })
    )?.get({ plain: true });

    return corpProfile;
};
