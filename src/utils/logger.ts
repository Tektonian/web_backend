import winston from "winston";
import WinstonDaily from "winston-daily-rotate-file";
import path from "path";
import * as rTracer from "cls-rtracer";

interface InformationType extends winston.Logform.TransformableInfo {
    // Both `level` and `message` must have properties

    // level: string;
    // message: string;
    errorCode?: string;
    apiName?: string;
    logBy?: string;
    traceId?: string;
    depth?: number[];
    funcArgs?: JSON;
}

// a custom format that outputs request id
const rTracerFormat = winston.format.printf((info: InformationType) => {
    const priorPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = (err, stack) => {
        return stack;
    };
    // golden number: 21!!
    const errorAt = new Error().stack?.at(21) ?? "";
    Error.prepareStackTrace = priorPrepareStackTrace;
    const rid = rTracer.id();
    return rid
        ? `${info.timestamp} [request-id:${rid}]: ${errorAt.getEvalOrigin()} ${errorAt.getMethodName()} ${errorAt.getFunctionName()}:${errorAt.getLineNumber()} ${info.message}`
        : `${info.timestamp}: ${info.message}`;
});

let loggerOption: winston.LoggerOptions;

if (process.env.NODE_ENV === "production") {
    loggerOption = {
        format: winston.format.combine(
            winston.format.timestamp({ format: "YYYY-MM-DD hh:mm:ss.SSS" }),
            winston.format.json(),
            winston.format.printf((info: InformationType) => {
                if (info.level) {
                    info.level = info.level.toUpperCase(); // 로그 레벨을 대문자로
                }

                return JSON.stringify(info);
            }),
        ),
        transports: [
            new WinstonDaily({
                level: "info",
                datePattern: "YYYY-MM-DD",
                dirname: path.join(process.cwd(), "logs"),
                filename: `%DATE%.log`,
                maxFiles: 30, // 최대 30일치
                zippedArchive: true,
            }),
        ],
        exceptionHandlers: [
            new WinstonDaily({
                level: "error",
                datePattern: "YYYY-MM-DD",
                dirname: path.join(process.cwd(), "logs"),
                filename: `%DATE%.exception.log`,
                maxFiles: 30,
                zippedArchive: true,
            }),
        ],
        rejectionHandlers: [
            new WinstonDaily({
                level: "error",
                datePattern: "YYYY-MM-DD",
                dirname: path.join(process.cwd(), "logs"),
                filename: `%DATE%.rejection.log`,
                maxFiles: 30,
                zippedArchive: true,
            }),
        ],
    };
} else if (process.env.NODE_ENV === "development" || true) {
    loggerOption = {
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.prettyPrint(),
                    winston.format.colorize(),
                    winston.format.errors({ stack: true }),
                    winston.format.timestamp({
                        format: "YYYY-MM-DD hh:mm:ss.SSS",
                    }),
                    rTracerFormat,
                ),
            }),
        ],
        exceptionHandlers: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.timestamp({
                        format: "YYYY-MM-DD hh:mm:ss.SSS",
                    }),
                    winston.format.metadata(),
                    winston.format.prettyPrint(),
                ),
            }),
        ],
        rejectionHandlers: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.timestamp({
                        format: "YYYY-MM-DD hh:mm:ss.SSS",
                    }),
                    winston.format.metadata(),
                    winston.format.prettyPrint(),
                ),
            }),
        ],
    };
}

const logger = winston.createLogger(loggerOption);

export default logger;
