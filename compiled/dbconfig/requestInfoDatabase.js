import { Sequelize } from "sequelize";
const requestInfoSequelize = new Sequelize("requestInfo", "root", "1q2w3e4r", {
    host: "localhost",
    dialect: "mysql",
});
export default requestInfoSequelize;
