import { Sequelize } from "sequelize";

const corpProfileSequelize = new Sequelize(
    "corpProfile",
    "Min",
    "starcraft973",
    {
        host: "localhost",
        dialect: "mysql",
    },
);

export default corpProfileSequelize;
