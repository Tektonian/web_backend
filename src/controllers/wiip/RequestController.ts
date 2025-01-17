import { models, sequelize } from "../../models/rdbms";
import { MeiliSearch } from "meilisearch";
import { Op } from "sequelize";
import { ChatRoom } from "../../models/chat";

/**
 * Types, Errors, Utils ...
 */
import logger from "../../utils/logger";
import * as Errors from "../../errors";
import { RequestEnum } from "@mesh/api_spec/enum";
import { ConsumerEnum } from "@mesh/api_spec/enum";
import type { RequestAttributes } from "../../models/rdbms/Request";
import { Consumer } from "../../models/rdbms/Consumer";
const client = new MeiliSearch({
    host: process.env.MEILISEARCH_HOST as string,
    apiKey: process.env.MEILISEARCH_KEY,
});

const requestSearch = client.index("request");
// requestSearch.updateFilterableAttributes(["_geo"]);
// requestSearch.updateSortableAttributes(["_geo"]);

const AcademicHistory = models.AcademicHistory;
const RequestModel = models.Request;
const ConsumerModel = models.Consumer;
const Student = models.Student;
const ProviderModel = models.Provider;

export const getRecommendedRequestByStudentId = async (student_id: number) => {
    const student = (
        await Student.findOne({
            where: { student_id: student_id },
        })
    )?.get({ plain: true });
    /**
     * TODO: fill logic later
     * We will return every requests for now;

    const coordi = JSON.parse(JSON.stringify(student?.coordinate)).coordinates;

    const searchRet = await requestSearch.search("", {
        filter: [`_geoRadius(${coordi[0]}, ${coordi[1]}, 1000000000000)`],
        sort: [`_geoPoint(${coordi[0]}, ${coordi[1]}):asc`],
    });
     */

    const requests = await RequestModel.findAll({
        where: {
            [Op.or]: [
                { request_status: RequestEnum.REQUEST_STATUS_ENUM.POSTED },
                { request_status: RequestEnum.REQUEST_STATUS_ENUM.PAID },
                { request_status: RequestEnum.REQUEST_STATUS_ENUM.CONTRACTED },
            ],
        },
        limit: 999,
    });

    return requests;
};

export const getRequestByRequestId = async (requestId: number) => {
    const request = await RequestModel.findOne({
        where: { request_id: requestId },
    });
    return request;
};

/**
 *
 * @deprecated
 */
export const getRequestByStudentId = async (studentId: number) => {
    throw new Error("");
};

export const getRequestsByOrgnId = async (orgnId: number) => {
    const requests = await RequestModel.findAll({
        where: { orgn_id: orgnId },
    });
    return requests;
};

export const getRequestsByCorpId = async (corpId: number) => {
    const requests = await RequestModel.findAll({
        where: { corp_id: corpId },
    });
    return requests;
};

export const getRequestsByProviderUserId = async (userId: Buffer) => {
    const providerList = await ProviderModel.findAll({ where: { user_id: userId }, raw: true });

    const uniqueRequestIds = Array.from(new Set(providerList.map((val) => val.request_id)));

    const requests = await RequestModel.findAll({ where: { request_id: { [Op.in]: uniqueRequestIds } } });

    return requests;
};

// TODO: need refactoring
export const getPostedRequestsByUserId = async (userId: Buffer) => {
    const consumerIds = (await Consumer.findAll({ where: { user_id: userId }, raw: true })).map(
        (val) => val.consumer_id,
    );

    const postedRequests = await RequestModel.findAll({ where: { consumer_id: { [Op.in]: consumerIds } } });

    return postedRequests;
};

export const updateRequestProviderIds = async (newProviderIds: Buffer[], requestId: number) => {
    try {
        const ret = await sequelize.transaction(async (t) => {
            logger.info("Start: Transaction-[Change provider ids]");
            await Promise.all(
                newProviderIds.map(async (providerId) => {
                    const student = await Student.findOne({ where: { user_id: providerId }, raw: true });
                    if (!student) {
                        throw new Errors.ServiceErrorBase(
                            "updateRequestProviderIds called non-exist user - something went wrong",
                        );
                    }
                    return ProviderModel.findOrCreate({
                        where: {
                            [Op.and]: [{ request_id: requestId }, { user_id: providerId }],
                        },
                        defaults: {
                            request_id: requestId,
                            user_id: student.user_id,
                            student_id: student.student_id,
                        },
                        transaction: t,
                    });
                }),
            );

            await ProviderModel.destroy({
                where: { [Op.and]: [{ request_id: requestId }, { user_id: { [Op.notIn]: newProviderIds } }] },
                transaction: t,
            });

            logger.info("END: Transaction-[Change provider ids]");
            return newProviderIds;
        });
        return ret;
    } catch (error) {
        logger.error(`FAILED: Transaction-[Change provider ids], ${error}`);
        throw new Errors.ServiceErrorBase(`updateRequestProviderIds failed transaction: ${error}`);
    }
};

// api_spec 문서 보고 데이터 타비 맞춰서 리턴하도록 수정
export const createRequest = async (
    userId: Buffer,
    role: ConsumerEnum.CONSUMER_ENUM,
    data: Omit<RequestAttributes, "consumer_id" | "request_id">,
) => {
    try {
        const ret = await sequelize.transaction(async (t) => {
            logger.info("Start: Transaction-[Create Request]");

            const consumerIdentity = (
                await ConsumerModel.findOne({
                    where: {
                        [Op.and]: [{ user_id: userId }, { consumer_type: role }],
                    },
                    transaction: t,
                })
            )?.get({ plain: true });

            if (consumerIdentity === undefined) {
                throw new Errors.ServiceExceptionBase("No consumer identity exist");
            }
            const createdRequest = await RequestModel.create(
                {
                    ...data,
                    corp_id: consumerIdentity.corp_id,
                    orgn_id: consumerIdentity.orgn_id,
                    consumer_id: consumerIdentity.consumer_id,
                },
                { transaction: t },
            );

            logger.info(`INTER-Request created: ${JSON.stringify(createdRequest.toJSON())}`);

            const coordinates = createdRequest.toJSON().address_coordinate.coordinates;

            const searchRet = await requestSearch.addDocuments(
                [
                    {
                        ...createdRequest.dataValues,
                        // Primary key value is in model value
                        request_id: createdRequest.request_id,
                        _geo: { lat: coordinates[0], lng: coordinates[1] },
                    },
                ],
                { primaryKey: "request_id" },
            );

            const searchTask = await client.waitForTask(searchRet.taskUid);

            if (searchTask.status !== "succeeded") {
                throw new Errors.ServiceExceptionBase("No record created! " + JSON.stringify(searchTask));
            }
            logger.info("INTER-Request has been added to Search Engine");
            return createdRequest.request_id;
        });

        logger.info("End-Transaction-[Create request]");
        return ret;
    } catch (error) {
        // transaction failed
        logger.error(`Created Request Error: ${error}`);
        return undefined;
    }
};

export const updateRequestStatus = async (requestId: number, status: RequestEnum.REQUEST_STATUS_ENUM) => {
    const request = await RequestModel.findOne({
        where: { request_id: requestId },
        raw: true,
    });

    if (request === null) {
        throw new Errors.ServiceExceptionBase("No such request");
    }

    try {
        const ret = await sequelize.transaction(async (t) => {
            logger.info("START: Transaction-[Update Request Status]");

            if (
                status === RequestEnum.REQUEST_STATUS_ENUM.FINISHED ||
                status === RequestEnum.REQUEST_STATUS_ENUM.FAILED ||
                status === RequestEnum.REQUEST_STATUS_ENUM.OUTDATED
            ) {
                const searchRet = await requestSearch.deleteDocument(request.request_id);
                const searchTask = await client.waitForTask(searchRet.taskUid);

                if (searchTask.status !== "succeeded") {
                    logger.info("FAILED: Transaction-[Update Request Status]");
                    throw new Errors.ServiceExceptionBase(
                        "Failed to update request status on Meilisearch! " + JSON.stringify(searchTask),
                    );
                }
            }

            const count = await RequestModel.update(
                { request_status: status },
                { where: { request_id: request.request_id }, transaction: t },
            );

            logger.info("INTER: Transaction-[Update Request Status]");
            return count;
        });

        logger.info("END: Transaction-[Update Request Status]");
        return ret;
    } catch (error) {
        // transaction failed
        logger.error(`Update request status Error: ${error}`);
        throw error;
    }
};
