import { Sequelize } from "sequelize";

const requestInfoSequelize = new Sequelize(
    "requestInfo",
    "Min",
    "starcraft973",
    {
        host: "localhost",
        dialect: "mysql",
    },
);

export default requestInfoSequelize;
