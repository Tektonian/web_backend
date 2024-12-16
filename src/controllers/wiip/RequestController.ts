import { models, sequelize } from "../../models/rdbms";
import { MeiliSearch } from "meilisearch";
import { Op } from "sequelize";
import { DataTypes } from "sequelize";
import { APIType } from "api_spec";
import logger from "../../utils/logger";
import { Consumer } from "../../models/rdbms/Consumer";
import { ChatRoom } from "../../models/chat";

const client = new MeiliSearch({
    host: "http://127.0.0.1:7700",
    apiKey: "1zBmtAMDjgWPGLcTPAhEy-kRZv44BzxywQ1UHPkIYE0",
});

const requestSearch = client.index("request");
// requestSearch.updateFilterableAttributes(["_geo"]);
// requestSearch.updateSortableAttributes(["_geo"]);

const StudentWithCurrentSchool = models.studentwithcurrentschool;
const RequestModel = models.Request;
const ConsumerModel = models.Consumer;
const UserModel = models.User;

export const getRecommendedRequestByStudentId = async (student_id: number) => {
    const student = (
        await StudentWithCurrentSchool.findOne({
            where: { student_id: student_id },
        })
    )?.get({ plain: true });

    const coordi = JSON.parse(JSON.stringify(student?.coordinate)).coordinates;

    const searchRet = await requestSearch.search("", {
        filter: [`_geoRadius(${coordi[0]}, ${coordi[1]}, 1000000000000)`],
        sort: [`_geoPoint(${coordi[0]}, ${coordi[1]}):asc`],
    });

    return searchRet;
};

export const getRequestByRequestId = async (request_id: number) => {
    const request = await RequestModel.findOne({
        where: { request_id: request_id },
    });
    return request;
};

export const getRequestsByUserId = async (
    userId: Buffer,
    as: "consumer" | "provider" | undefined = undefined,
) => {
    /**
     * We can search chatrooms to identify all users related with request
     */
    let requestIds = [] as number[];
    if (as === undefined) {
        const chatRooms = await ChatRoom.find({
            participant_ids: { $in: userId },
        });
        // request_id could be less than 0 (when deleted)
        requestIds = Array.from(
            new Set(chatRooms.map((room) => Math.abs(room.request_id))),
        );
    } else if (as === "consumer") {
        const chatRooms = await ChatRoom.find({
            consumer_id: userId,
        });
        // request_id could be less than 0 (when deleted)
        requestIds = Array.from(
            new Set(chatRooms.map((room) => Math.abs(room.request_id))),
        );
    } else if (as === "provider") {
        const chatRooms = await ChatRoom.find({
            $and: [
                { consumer_id: { $ne: userId } },
                { participant_ids: { $in: userId } },
            ],
        });
        // request_id could be less than 0 (when deleted)
        requestIds = Array.from(
            new Set(chatRooms.map((room) => Math.abs(room.request_id))),
        );
    }

    return await RequestModel.findAll({ where: { request_id: requestIds } });
};

export const updateRequestProviderIds = async (
    newProviderIds: Buffer[],
    requestId: number,
) => {
    return await RequestModel.update(
        // Buffer type UUID will be stringfied
        { provider_ids: newProviderIds },
        { where: { request_id: requestId } },
    );
};

// api_spec 문서 보고 데이터 타비 맞춰서 리턴하도록 수정
export const createRequest = async (
    uuid: typeof DataTypes.UUID,
    role: "corp" | "orgn" | "normal",
    data,
) => {
    try {
        const ret = await sequelize.transaction(async (t) => {
            logger.info("Start: Transaction-[Create Request]");
            const consumerIdentity = (
                await ConsumerModel.findOne({
                    where: {
                        [Op.and]: [{ user_id: uuid }, { consumer_type: role }],
                    },
                    transaction: t,
                })
            )?.get({ plain: true });

            if (consumerIdentity === undefined) {
                throw new Error("No consumer identity exist");
            }
            // TODO: should add corp_id or orgn_id according to consumer identity
            const createdRequest = await RequestModel.create(
                {
                    ...data,
                    consumer_id: consumerIdentity.consumer_id,
                },
                { transaction: t },
            );

            logger.info(`Request created: ${createRequest}`);

            const coordinate = JSON.parse(
                JSON.stringify(createdRequest.dataValues.address_coordinate),
            ).coordinates;

            const searchRet = await requestSearch.addDocuments(
                [
                    {
                        ...createdRequest.dataValues,
                        request_id: createdRequest.request_id,
                        _geo: { lat: coordinate[0], lng: coordinate[1] },
                    },
                ],
                { primaryKey: "request_id" },
            );

            const searchTask = await client.waitForTask(searchRet.taskUid);

            if (searchTask.status !== "succeeded") {
                throw new Error(
                    "No record created! " + JSON.stringify(searchTask),
                );
            }
            logger.info("Request has been added to Search Engine");
            return createdRequest.request_id;
        });
        logger.info("End: Transaction-[Create request]");
        return ret;
    } catch (error) {
        // transaction failed
        logger.error(`Created Request Error: ${error}`);
        return undefined;
    }
};

export const updateRequestStatus = async (
    requestId: number,
    status: APIType.RequestType.REQUEST_STATUS_ENUM,
) => {
    const request = await RequestModel.findOne({
        where: { request_id: requestId },
        raw: true,
    });

    if (request === null) {
        logger.info("No such request");
        return undefined;
    }

    return await RequestModel.update(
        { request_status: status },
        { where: { request_id: request.request_id } },
    );
};
