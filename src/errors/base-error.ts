import type { Request } from "express";

export class ServiceErrorBase extends Error {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "Service Error";
    }
}

interface ExceptionItem {
    redirection?: string;
    responseCode?: number;
}

export class ServiceExceptionBase extends Error {
    readonly responseCode: number;
    readonly redirection: string | null;
    constructor(message?: string, item: ExceptionItem = {}, options: ErrorOptions = {}) {
        super(message, options);
        this.responseCode = item.responseCode ?? 400;
        this.redirection = item.redirection || null;
        this.name = "Service Exception";
    }
}
