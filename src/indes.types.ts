import * as express from "express";
import { DefaultSession } from "@auth/express";
import "joi-extract-type"; // <- import joi-extract-type for type hint for router
declare global {
    namespace Express {
        /** Extend Response types to add user session information */
        export interface Response {
            session?: {
                user: {
                    id: Buffer;
                    name: string;
                    email: string;
                    roles: string[];
                };
            };
        }
        /** Extend Request types for logging
         * @see {@link auth.middleware.ts } and {@link index.ts}
         */
        export interface Request {
            uuid?: string;
        }
    }
}

declare module "@auth/express" {
    /** Extend @auth/epxress module types to add extra fields such as roles */
    interface Session {
        user?: {
            id: {
                type: "Buffer";
                data: number[];
            };
            name: string;
            email: string;
            image: string;
            roles: string[];
        };
    }
}
