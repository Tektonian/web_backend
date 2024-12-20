import { APIType } from "api_spec";
import { RequestHandler } from "express";
import * as Schemas from "api_spec/joi";
import * as Joi from "@hapi/joi";
import "joi-extract-type";

type ExtractedSchema<Schema> = Schema extends Joi.Schema ? Joi.extractType<Schema> : null;

export function ValidateSchema<S extends Joi.Schema, T extends Joi.extractType<S>>(schema: S, data: T): T {
    Joi.assert(data, schema);
    const { error, value } = schema.validate(data);
    return value;
}
