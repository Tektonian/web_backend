import { z } from "zod";
export function ValidateSchema<S extends z.Schema, T extends z.infer<S>>(schema: S, value: T): T {
    const { success, error, data } = schema.safeParse(value);
    if (error) {
        throw error;
    }

    return value;
}
