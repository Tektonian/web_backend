import type { ErrorRequestHandler } from "express";

/**
 * Run time exceptions
 */
import { JoiError } from "../errors";
import { SSEError } from "../errors";
import { ServiceExceptionBase } from "../errors";
/**
 * Operational Error
 */
import { ServiceErrorBase } from "../errors";
import { SequelizeError } from "../errors";
import { MongooseError } from "../errors";
import { BullMqError } from "../errors";
import { MulterError } from "../errors";
import { MeiliSearchError } from "../errors";

import logger from "../utils/logger";

const errorHandleMiddleware: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof JoiError) {
    } else if (err instanceof SSEError) {
    } else if (err instanceof ServiceExceptionBase) {
    } else if (err instanceof ServiceErrorBase) {
        logger.error(`Service error base ${err}`);
        process.exit();
    } else if (err instanceof SequelizeError) {
    } else if (err instanceof MongooseError) {
    } else if (err instanceof MulterError) {
    } else if (err instanceof MeiliSearchError) {
    } else if (err instanceof BullMqError) {
    }
    next();
};

export default errorHandleMiddleware;
