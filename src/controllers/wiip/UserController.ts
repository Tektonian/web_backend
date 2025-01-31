/**
 * Models
 */
import sequelize from "sequelize";
import { models } from "../../models/rdbms";

const User = models.User;
const Consumer = models.Consumer;
const Student = models.Student;

import { APIType } from "@mesh/api_spec";
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

export const updateUserByUserId = async (userId: Buffer, data: APIType.UserType.ReqUpdateUserProfile) => {
    const updatedUser = await User.update(
        {
            username: data.username,
            nationality: data.nationality,
            working_country: data.working_country,
            image: data.image,
        },
        { where: { user_id: userId } },
    );

    return updatedUser;
};
