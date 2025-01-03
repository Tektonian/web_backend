import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";
import type { Request, RequestId } from "./Request";
import type { Student, StudentId } from "./Student";
import type { User, UserId } from "./User";

export interface ProviderAttributes {
    provider_id: number;
    contracted_at?: Date;
    request_attend_at?: Date;
    attend_approved_at?: Date;
    finish_job_at?: Date;
    received_money_at?: Date;
    provider_status: number;
    student_id: number;
    user_id: any;
    request_id: number;
    created_at?: Date;
    updated_at?: Date;
}

export type ProviderPk = "provider_id";
export type ProviderId = Provider[ProviderPk];
export type ProviderOptionalAttributes =
    | "provider_id"
    | "contracted_at"
    | "request_attend_at"
    | "attend_approved_at"
    | "finish_job_at"
    | "received_money_at"
    | "provider_status"
    | "created_at"
    | "updated_at";
export type ProviderCreationAttributes = Optional<ProviderAttributes, ProviderOptionalAttributes>;

export class Provider extends Model<ProviderAttributes, ProviderCreationAttributes> implements ProviderAttributes {
    provider_id!: number;
    contracted_at?: Date;
    request_attend_at?: Date;
    attend_approved_at?: Date;
    finish_job_at?: Date;
    received_money_at?: Date;
    provider_status!: number;
    student_id!: number;
    user_id!: any;
    request_id!: number;
    created_at?: Date;
    updated_at?: Date;

    // Provider belongsTo Request via request_id
    request!: Request;
    getRequest!: Sequelize.BelongsToGetAssociationMixin<Request>;
    setRequest!: Sequelize.BelongsToSetAssociationMixin<Request, RequestId>;
    createRequest!: Sequelize.BelongsToCreateAssociationMixin<Request>;
    // Provider belongsTo Student via student_id
    student!: Student;
    getStudent!: Sequelize.BelongsToGetAssociationMixin<Student>;
    setStudent!: Sequelize.BelongsToSetAssociationMixin<Student, StudentId>;
    createStudent!: Sequelize.BelongsToCreateAssociationMixin<Student>;
    // Provider belongsTo User via user_id
    user!: User;
    getUser!: Sequelize.BelongsToGetAssociationMixin<User>;
    setUser!: Sequelize.BelongsToSetAssociationMixin<User, UserId>;
    createUser!: Sequelize.BelongsToCreateAssociationMixin<User>;

    static initModel(sequelize: Sequelize.Sequelize): typeof Provider {
        return Provider.init(
            {
                provider_id: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                },
                contracted_at: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },
                request_attend_at: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },
                attend_approved_at: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },
                finish_job_at: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },
                received_money_at: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },
                provider_status: {
                    type: DataTypes.TINYINT,
                    allowNull: false,
                    defaultValue: 0,
                },
                student_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: "Student",
                        key: "student_id",
                    },
                },
                user_id: {
                    type: DataTypes.BLOB,
                    allowNull: false,
                    references: {
                        model: "User",
                        key: "user_id",
                    },
                },
                request_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: "Request",
                        key: "request_id",
                    },
                },
            },
            {
                sequelize,
                tableName: "Provider",
                timestamps: true,
                createdAt: "created_at",
                updatedAt: "updated_at",
                indexes: [
                    {
                        name: "PRIMARY",
                        unique: true,
                        using: "BTREE",
                        fields: [{ name: "provider_id" }],
                    },
                    {
                        name: "user_id_fk_idx",
                        using: "BTREE",
                        fields: [{ name: "user_id" }],
                    },
                    {
                        name: "student_id_fk_idx",
                        using: "BTREE",
                        fields: [{ name: "student_id" }],
                    },
                    {
                        name: "request_id_fk_idx",
                        using: "BTREE",
                        fields: [{ name: "request_id" }],
                    },
                ],
            },
        );
    }
}
