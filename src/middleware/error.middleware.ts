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
import { ValidationError } from "joi";
import logger from "../utils/logger";

const errorHandleMiddleware: ErrorRequestHandler = (err, req, res, next) => {
    /**
     * JoiError class is anonymous class (which means console.log(JoiError) === [class anonymous extends Error])
     * So we can't use 'instanceof' here.
     * use isJoi here (but leave code for code-readers)
     */
    if (err.isJoi || err instanceof JoiError) {
        const joiError = err as JoiError;

        logger.warn(JSON.stringify({ error: joiError, ip: req.ip, headers: req.headers, cookies: req.cookies }));
        res.status(404).json("");
    } else if (err instanceof SSEError) {
    } else if (err instanceof ServiceExceptionBase) {
    } else if (err instanceof ServiceErrorBase) {
    } else if (err instanceof SequelizeError) {
    } else if (err instanceof MongooseError) {
    } else if (err instanceof MulterError) {
    } else if (err instanceof MeiliSearchError) {
    } else if (err instanceof BullMqError) {
    }
    next();
};

const JoiErrorHandler: ErrorRequestHandler = (err, req, res) => {};

export default errorHandleMiddleware;
