import sequelize from "sequelize";
import { User } from "../models/rdbms/User";

export const getUserByName = async (username: string) => {
    const userProfile = await User.findOne({
        where: { username: username },
    });

    return userProfile;
};

export const getUserById = async (uuid) => {
    const user = await User.findByPk(uuid);
    console.log("getUserById ", uuid, user);
    return user;
};

export const getUsersById = async (uuids: (typeof DataTypes.UUID)[]) => {
    const users = await User.findAll({ where: { user_id: uuids } });

    return users;
};
