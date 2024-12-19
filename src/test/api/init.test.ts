import fs from "fs";
import Ajv from "ajv";

const openapiAvj = new Ajv({ strict: false, verbose: true });
const jsonSchema = JSON.parse(fs.readFileSync("openapi.json", "utf-8"));

openapiAvj.addSchema(jsonSchema, "openapi");

export default openapiAvj;
