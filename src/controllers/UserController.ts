import sequelize from "sequelize";
import { User } from "../models/rdbms/User";
import { Consumer } from "../models/rdbms/Consumer";
import { Student } from "../models/rdbms/Student";

export const getUserByName = async (username: string) => {
    const userProfile = await User.findOne({
        where: { username: username },
    });

    return userProfile;
};

export const getUserById = async (uuid: Buffer) => {
    const user = await User.findByPk(uuid);
    return user;
};

export const getUsersById = async (uuids: Buffer[]) => {
    const users = await User.findAll({ where: { user_id: uuids } });

    return users;
};

export const getUserByStudentId = async (studentId: number) => {
    const student = await Student.findOne({ where: { student_id: studentId }, raw: true });

    if (!student) {
        return undefined;
    }

    const user = await User.findOne({ where: { user_id: student.user_id } });

    return user;
};

export const getUserByConsumerId = async (consumerId: number) => {
    const consumer = (
        await Consumer.findOne({
            where: { consumer_id: consumerId },
        })
    )?.get({ plain: true });

    if (consumer === undefined) {
        return undefined;
    }

    const user = await User.findOne({
        where: { user_id: consumer.user_id },
    });

    return user;
};
