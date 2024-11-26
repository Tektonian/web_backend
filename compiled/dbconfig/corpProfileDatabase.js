import { Sequelize } from "sequelize";
const corpProfileSequelize = new Sequelize("corpProfile", "root ", "1q2w3e4r", {
    host: "localhost",
    dialect: "mysql",
});
export default corpProfileSequelize;
