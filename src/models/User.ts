import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";
import type { Account, AccountId } from "./Account";
import type { Consumer, ConsumerId } from "./Consumer";
import type { Student, StudentId } from "./Student";

export interface UserAttributes {
    user_id: any;
    username?: string;
    email: string;
    created_at?: Date;
    email_verified?: Date;
    image?: string;
    roles?: object;
}

export type UserPk = "user_id";
export type UserId = User[UserPk];
export type UserOptionalAttributes =
    | "user_id"
    | "username"
    | "created_at"
    | "email_verified"
    | "image"
    | "roles";
export type UserCreationAttributes = Optional<
    UserAttributes,
    UserOptionalAttributes
>;

export class User
    extends Model<UserAttributes, UserCreationAttributes>
    implements UserAttributes
{
    user_id!: any;
    username?: string;
    email!: string;
    created_at?: Date;
    email_verified?: Date;
    image?: string;
    roles?: object;

    // User hasMany Account via user_id
    Accounts!: Account[];
    getAccounts!: Sequelize.HasManyGetAssociationsMixin<Account>;
    setAccounts!: Sequelize.HasManySetAssociationsMixin<Account, AccountId>;
    addAccount!: Sequelize.HasManyAddAssociationMixin<Account, AccountId>;
    addAccounts!: Sequelize.HasManyAddAssociationsMixin<Account, AccountId>;
    createAccount!: Sequelize.HasManyCreateAssociationMixin<Account>;
    removeAccount!: Sequelize.HasManyRemoveAssociationMixin<Account, AccountId>;
    removeAccounts!: Sequelize.HasManyRemoveAssociationsMixin<
        Account,
        AccountId
    >;
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
    removeConsumer!: Sequelize.HasManyRemoveAssociationMixin<
        Consumer,
        ConsumerId
    >;
    removeConsumers!: Sequelize.HasManyRemoveAssociationsMixin<
        Consumer,
        ConsumerId
    >;
    hasConsumer!: Sequelize.HasManyHasAssociationMixin<Consumer, ConsumerId>;
    hasConsumers!: Sequelize.HasManyHasAssociationsMixin<Consumer, ConsumerId>;
    countConsumers!: Sequelize.HasManyCountAssociationsMixin;
    // User hasMany Student via user_id
    Students!: Student[];
    getStudents!: Sequelize.HasManyGetAssociationsMixin<Student>;
    setStudents!: Sequelize.HasManySetAssociationsMixin<Student, StudentId>;
    addStudent!: Sequelize.HasManyAddAssociationMixin<Student, StudentId>;
    addStudents!: Sequelize.HasManyAddAssociationsMixin<Student, StudentId>;
    createStudent!: Sequelize.HasManyCreateAssociationMixin<Student>;
    removeStudent!: Sequelize.HasManyRemoveAssociationMixin<Student, StudentId>;
    removeStudents!: Sequelize.HasManyRemoveAssociationsMixin<
        Student,
        StudentId
    >;
    hasStudent!: Sequelize.HasManyHasAssociationMixin<Student, StudentId>;
    hasStudents!: Sequelize.HasManyHasAssociationsMixin<Student, StudentId>;
    countStudents!: Sequelize.HasManyCountAssociationsMixin;

    static initModel(sequelize: Sequelize.Sequelize): typeof User {
        return User.init(
            {
                user_id: {
                    type: DataTypes.BLOB,
                    allowNull: false,
                    defaultValue: Sequelize.Sequelize.literal(
                        "uuid_to_bin(uuid())",
                    ),
                    primaryKey: true,
                },
                username: {
                    type: DataTypes.STRING(64),
                    allowNull: true,
                },
                email: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                email_verified: {
                    type: DataTypes.DATE,
                    allowNull: true,
                    comment:
                        "Insert verified time / if not the default value should be null",
                },
                image: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                roles: {
                    type: DataTypes.JSON,
                    allowNull: true,
                    comment:
                        "To implement RBAC based access control, `roles` are needed.\n\nWe can filter unauthorized requests with role entity without querying database.\n\nOnce verification has been occurred user’s roles must be changed!!!!",
                },
            },
            {
                sequelize,
                tableName: "User",
                timestamps: false,
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
