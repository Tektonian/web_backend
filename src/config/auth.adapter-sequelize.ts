import type {
    Adapter,
    AdapterUser,
    AdapterAccount,
    AdapterSession,
    VerificationToken,
} from "@auth/core/adapters";
import { Sequelize, Model } from "sequelize";
import { models } from "../models";
import { VerificationTokenTypes } from "../models/roles/VerificationToken.types";

export default function SequelizeAdapter(client: Sequelize): Adapter {
    const { User, Account, VerificationToken, Consumer } = models;

    let _synced = false;
    const sync = async () => {
        if (process.env.NODE_ENV !== "production" && !_synced) {
            await Promise.all([
                User.sync(),
                Account.sync(),
                VerificationToken.sync(),
            ]);

            _synced = true;
        }
    };
    Account.belongsTo(User, { onDelete: "cascade" });

    return {
        async createUser(user) {
            await sync();
            const userInstance = await User.create(user);
            const consumerInstance = await Consumer.create({
                user_id: user.id,
                consumer_email: user.email,
                consumer_type: "normal",
                phone_number: "",
            });

            return userInstance;
        },
        async gerUser(id) {
            await sync();

            const userInstance = await User.findByPk(id);

            return userInstance?.get({ plane: true }) ?? null;
        },
        async getUserByEmail(email) {
            await sync();

            const userInstance = await User.findOne({
                where: { email },
            });

            return userInstance?.get({ plain: true }) ?? null;
        },
        async getUserByAccount({ provider, providerAccountId }) {
            await sync();

            const accountInstance = await Account.findOne({
                where: { provider, providerAccountId },
            });

            if (!accountInstance) {
                return null;
            }

            const userInstance = await User.findByPk(accountInstance.user_id);

            return userInstance?.get({ plain: true }) ?? null;
        },
        async updateUser(user) {
            await sync();

            await User.update(user, { where: { id: user.id } });
            const userInstance = await User.findByPk(user.id);

            return userInstance;
        },
        async deleteUser(userId) {
            await sync();

            const userInstance = await User.findByPk(userId);
            // Consumer data of user will be destroyed automatically
            // On delete casacade
            await User.destroy({ where: { id: userId } });

            return userInstance;
        },
        async unlinkAccount({ provider, providerAccountId }) {
            await sync();

            await Account.destroy({
                where: { provider, providerAccountId },
            });
        },
        async createVerificationToken(verificationToken) {
            await sync();

            return await VerificationToken.create(verificationToken);
        },
        async useVerificationToken({ identifier, token }) {
            await sync();

            const tokenInstance = await VerificationToken.findOne({
                where: { identifier, token },
            });

            await VerificationToken.destroy({ where: { identifier } });

            return tokenInstance?.get({ plane: true }) ?? null;
        },
    };
}
