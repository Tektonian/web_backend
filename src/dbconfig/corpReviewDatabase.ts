import { Sequelize } from "sequelize";

const corpReviewSequelize = new Sequelize(
    "corpProfile",
    "Min",
    "starcraft973",
    {
        host: "localhost",
        dialect: "mysql",
    },
);

export default corpReviewSequelize;
