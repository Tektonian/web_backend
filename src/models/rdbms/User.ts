import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";
import type { Account, AccountId } from "./Account";
import type { Consumer, ConsumerId } from "./Consumer";
import type { Provider, ProviderId } from "./Provider";
import type { Student, StudentId } from "./Student";
import { UserEnum } from "api_spec/enum";
import { CountryCodeEnum } from "api_spec/enum";

export interface UserAttributes {
    user_id: any;
    username?: string;
    email: string;
    created_at?: Date;
    updated_at?: Date;
    image?: string;
    nationality?: CountryCodeEnum.COUNTRY_CODE_ENUM;
    working_country?: CountryCodeEnum.COUNTRY_CODE_ENUM;
    roles?: UserEnum.USER_ROLE_ENUM[];
}

export type UserPk = "user_id";
export type UserId = User[UserPk];
export type UserOptionalAttributes =
    | "user_id"
    | "username"
    | "created_at"
    | "updated_at"
    | "image"
    | "nationality"
    | "working_country"
    | "roles";
export type UserCreationAttributes = Optional<UserAttributes, UserOptionalAttributes>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    user_id!: any;
    username?: string;
    email!: string;
    created_at?: Date;
    updated_at?: Date;
    image?: string;
    nationality?: CountryCodeEnum.COUNTRY_CODE_ENUM;
    working_country?: CountryCodeEnum.COUNTRY_CODE_ENUM;
    roles?: UserEnum.USER_ROLE_ENUM[];

    // User hasMany Account via user_id
    Accounts!: Account[];
    getAccounts!: Sequelize.HasManyGetAssociationsMixin<Account>;
    setAccounts!: Sequelize.HasManySetAssociationsMixin<Account, AccountId>;
    addAccount!: Sequelize.HasManyAddAssociationMixin<Account, AccountId>;
    addAccounts!: Sequelize.HasManyAddAssociationsMixin<Account, AccountId>;
    createAccount!: Sequelize.HasManyCreateAssociationMixin<Account>;
    removeAccount!: Sequelize.HasManyRemoveAssociationMixin<Account, AccountId>;
    removeAccounts!: Sequelize.HasManyRemoveAssociationsMixin<Account, AccountId>;
    hasAccount!: Sequelize.HasManyHasAssociationMixin<Account, AccountId>;
    hasAccounts!: Sequelize.HasManyHasAssociationsMixin<Account, AccountId>;
    countAccounts!: Sequelize.HasManyCountAssociationsMixin;
    // User hasMany Consumer via user_id
    Consumers!: Consumer[];
    getConsumers!: Sequelize.HasManyGetAssociationsMixin<Consumer>;
    setConsumers!: Sequelize.HasManySetAssociationsMixin<Consumer, ConsumerId>;
    addConsumer!: Sequelize.HasManyAddAssociationMixin<Consumer, ConsumerId>;
    addConsumers!: Sequelize.HasManyAddAssociationsMixin<Consumer, ConsumerId>;
    createConsumer!: Sequelize.HasManyCreateAssociationMixin<Consumer>;
    removeConsumer!: Sequelize.HasManyRemoveAssociationMixin<Consumer, ConsumerId>;
    removeConsumers!: Sequelize.HasManyRemoveAssociationsMixin<Consumer, ConsumerId>;
    hasConsumer!: Sequelize.HasManyHasAssociationMixin<Consumer, ConsumerId>;
    hasConsumers!: Sequelize.HasManyHasAssociationsMixin<Consumer, ConsumerId>;
    countConsumers!: Sequelize.HasManyCountAssociationsMixin;
    // User hasMany Provider via user_id
    Providers!: Provider[];
    getProviders!: Sequelize.HasManyGetAssociationsMixin<Provider>;
    setProviders!: Sequelize.HasManySetAssociationsMixin<Provider, ProviderId>;
    addProvider!: Sequelize.HasManyAddAssociationMixin<Provider, ProviderId>;
    addProviders!: Sequelize.HasManyAddAssociationsMixin<Provider, ProviderId>;
    createProvider!: Sequelize.HasManyCreateAssociationMixin<Provider>;
    removeProvider!: Sequelize.HasManyRemoveAssociationMixin<Provider, ProviderId>;
    removeProviders!: Sequelize.HasManyRemoveAssociationsMixin<Provider, ProviderId>;
    hasProvider!: Sequelize.HasManyHasAssociationMixin<Provider, ProviderId>;
    hasProviders!: Sequelize.HasManyHasAssociationsMixin<Provider, ProviderId>;
    countProviders!: Sequelize.HasManyCountAssociationsMixin;
    // User hasOne Student via user_id
    Student!: Student;
    getStudent!: Sequelize.HasOneGetAssociationMixin<Student>;
    setStudent!: Sequelize.HasOneSetAssociationMixin<Student, StudentId>;
    createStudent!: Sequelize.HasOneCreateAssociationMixin<Student>;

    static initModel(sequelize: Sequelize.Sequelize): typeof User {
        return User.init(
            {
                user_id: {
                    type: DataTypes.BLOB,
                    allowNull: false,
                    defaultValue: Sequelize.Sequelize.literal("uuid_to_bin(uuid())"),
                    primaryKey: true,
                },
                username: {
                    type: DataTypes.STRING(64),
                    allowNull: true,
                },
                email: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                    validate: {
                        isEmail: true,
                    },
                },
                image: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                nationality: {
                    type: DataTypes.STRING(4),
                    allowNull: true,
                    validate: {
                        isIn: [Object.values(CountryCodeEnum.COUNTRY_CODE_ENUM)],
                    },
                },
                working_country: {
                    type: DataTypes.STRING(4),
                    allowNull: true,
                    validate: {
                        isIn: [Object.values(CountryCodeEnum.COUNTRY_CODE_ENUM)],
                    },
                },
                roles: {
                    type: DataTypes.JSON,
                    allowNull: true,
                    comment:
                        "To implement RBAC based access control, `roles` are needed.\n\nWe can filter unauthorized requests with role entity without querying database.\n\nOnce verification has been occurred user’s roles must be changed!!!!",
                    validate: {
                        isValidRole(value: string[]) {
                            for (const role of value) {
                                if (typeof role !== "string") {
                                    throw new Error("Type validation failed");
                                }
                            }
                            const validRoleSet = new Set(Object.values(UserEnum.USER_ROLE_ENUM));
                            const valueSet = new Set(value);
                            // Admin identity for test and development
                            if (!valueSet.has("admin") && valueSet.difference(validRoleSet).size !== 0) {
                                throw new Error("Wrong role input");
                            }
                        },
                    },
                },
            },
            {
                sequelize,
                tableName: "User",
                timestamps: true,
                createdAt: "created_at",
                updatedAt: "updated_at",
                indexes: [
                    {
                        name: "PRIMARY",
                        unique: true,
                        using: "BTREE",
                        fields: [{ name: "user_id" }],
                    },
                    {
                        name: "user_id_UNIQUE",
                        unique: true,
                        using: "BTREE",
                        fields: [{ name: "user_id" }],
                    },
                ],
            },
        );
    }
}
