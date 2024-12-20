// We will wrap other services' error here, so other files can import from one source file

/**
 * Service error or exceptions
 */
export { ServiceErrorBase } from "./base-error";
export { ServiceExceptionBase } from "./base-error";

/**
 * Run time exceptions
 */
export { ValidationError as JoiError } from "joi";
export { SseError as SSEError } from "better-sse";

/**
 * Operational Error
 */
export { BaseError as SequelizeError } from "sequelize";
export { Error as MongooseError } from "mongoose";

export { MulterError } from "multer";
export { MeiliSearchError } from "meilisearch";

import { UnrecoverableError, WaitingChildrenError, RateLimitError, DelayedError } from "bullmq";

/**
 * Also wrap bull mq erros into one class by setting [Symbol.hasinstance]
 * Once you set a function following code will work
 *
 * const a = new UnrecoverableError()
 * const b = a instanceof BullMqError
 * console.log(b) <- must be true
 *
 */
export class BullMqError extends Error {
    static [Symbol.hasInstance](obj: Object) {
        if (
            obj instanceof UnrecoverableError ||
            obj instanceof WaitingChildrenError ||
            obj instanceof RateLimitError ||
            obj instanceof DelayedError
        ) {
            return true;
        }
        return false;
    }
    constructor(message?: string, options?: ErrorOptions) {
        super(message, options);
    }
}
