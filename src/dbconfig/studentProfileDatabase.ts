import { Sequelize } from "sequelize";

const studentProfileSequelize = new Sequelize(
    "studentProfile",
    "Min",
    "starcraft973",
    {
        host: "localhost",
        dialect: "mysql",
    },
);

export default studentProfileSequelize;
