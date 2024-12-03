import { Consumer } from "../../../models/rdbms/Consumer";
import { Corporation } from "../../../models/rdbms/Corporation";

import dotenv from "dotenv";
dotenv.config({ path: "global/kr/.env.local" });

const CORP_API_KEY = process.env.CORP_API_KEY;
const CORP_API_BASE_URL = process.env.CORP_API_BASE_URL;
const CORP_API_END_POINT = "getCorpOutline_V2";

export const externReqCorpProfile = async (corpNum: number) => {
    // watch out!! This code calls extern API request
    // Error should be handled carefully
    // Detailed spec of API can be found at https://www.data.go.kr/data/15043184/openapi.do#/API%20%EB%AA%A9%EB%A1%9D/getCorpOutline_V2
    try {
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
        console.log("extern", externJson);
        if (externJson.response.body.totalCount === 0) {
            // No such corporation exist
            return undefined;
        }

        return externJson.response.body.items.item;
    } catch (error) {
        console.log(error);
        return undefined;
    }
};

export const createCorpProfile = async (corpProfile) => {
    const createdProfile = (await Corporation.create(corpProfile)).get({
        plain: true,
    });

    return createdProfile;
};

export const findCorpProfileByCorpNum = async (corpNum: number) => {
    const corpProfile = (
        await Corporation.findOne({ where: { corp_num: corpNum } })
    )?.get({ plain: true });

    return corpProfile;
};
