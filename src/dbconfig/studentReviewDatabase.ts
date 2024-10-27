import { Sequelize } from "sequelize";

const studentReviewSequelize = new Sequelize(
    "studentReview",
    "Min",
    "starcraft973",
    {
        host: "localhost",
        dialect: "mysql",
    },
);

export default studentReviewSequelize;
