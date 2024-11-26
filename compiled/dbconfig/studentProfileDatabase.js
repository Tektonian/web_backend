import { Sequelize } from "sequelize";
const studentProfileSequelize = new Sequelize("studentProfile", "root ", "1q2w3e4r", {
    host: "localhost",
    dialect: "mysql",
});
export default studentProfileSequelize;
