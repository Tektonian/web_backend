import Joi from "@hapi/joi";
import "joi-extract-type";

export function ValidateSchema<S extends Joi.Schema, T extends Joi.extractType<S>>(schema: S, data: T): T {
    const { error, value } = schema.validate(data);
    if (error) {
        throw error;
    }

    return value;
}
