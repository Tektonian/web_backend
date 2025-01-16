import { Sequelize } from "sequelize";
import { initModels } from "./init-models";
import logger from "../../utils/logger";

export const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE!,
    process.env.MYSQL_USER!,
    process.env.MYSQL_PASSWORD!,
    {
        dialect: "mysql",
        logging: (msg) => logger.debug(msg),
        logQueryParameters: true,
        dialectOptions: {
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
        },
    },
);

export const models = initModels(sequelize);
