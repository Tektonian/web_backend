import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";
import type { Corporation, CorporationId } from "./Corporation";
import type { Organization, OrganizationId } from "./Organization";
import type { Request, RequestId } from "./Request";
import type { User, UserId } from "./User";
import { ConsumerEnum } from "api_spec/enum";
import { Op } from "sequelize";

export interface ConsumerAttributes {
    consumer_id: number;
    user_id?: any;
    corp_id?: number;
    orgn_id?: number;
    consumer_type: string;
    consumer_email: string;
    consumer_verified?: Date;
    phone_number: string;
    created_at?: Date;
    updated_at?: Date;
}

export type ConsumerPk = "consumer_id";
export type ConsumerId = Consumer[ConsumerPk];
export type ConsumerOptionalAttributes =
    | "consumer_id"
    | "user_id"
    | "corp_id"
    | "orgn_id"
    | "consumer_verified"
    | "created_at"
    | "updated_at";
export type ConsumerCreationAttributes = Optional<ConsumerAttributes, ConsumerOptionalAttributes>;

export class Consumer extends Model<ConsumerAttributes, ConsumerCreationAttributes> implements ConsumerAttributes {
    consumer_id!: number;
    user_id?: any;
    corp_id?: number;
    orgn_id?: number;
    consumer_type!: string;
    consumer_email!: string;
    consumer_verified?: Date;
    phone_number!: string;
    created_at?: Date;
    updated_at?: Date;

    // Consumer hasMany Request via consumer_id
    Requests!: Request[];
    getRequests!: Sequelize.HasManyGetAssociationsMixin<Request>;
    setRequests!: Sequelize.HasManySetAssociationsMixin<Request, RequestId>;
    addRequest!: Sequelize.HasManyAddAssociationMixin<Request, RequestId>;
    addRequests!: Sequelize.HasManyAddAssociationsMixin<Request, RequestId>;
    createRequest!: Sequelize.HasManyCreateAssociationMixin<Request>;
    removeRequest!: Sequelize.HasManyRemoveAssociationMixin<Request, RequestId>;
    removeRequests!: Sequelize.HasManyRemoveAssociationsMixin<Request, RequestId>;
    hasRequest!: Sequelize.HasManyHasAssociationMixin<Request, RequestId>;
    hasRequests!: Sequelize.HasManyHasAssociationsMixin<Request, RequestId>;
    countRequests!: Sequelize.HasManyCountAssociationsMixin;
    // Consumer belongsTo Corporation via corp_id
    corp!: Corporation;
    getCorp!: Sequelize.BelongsToGetAssociationMixin<Corporation>;
    setCorp!: Sequelize.BelongsToSetAssociationMixin<Corporation, CorporationId>;
    createCorp!: Sequelize.BelongsToCreateAssociationMixin<Corporation>;
    // Consumer belongsTo Organization via orgn_id
    orgn!: Organization;
    getOrgn!: Sequelize.BelongsToGetAssociationMixin<Organization>;
    setOrgn!: Sequelize.BelongsToSetAssociationMixin<Organization, OrganizationId>;
    createOrgn!: Sequelize.BelongsToCreateAssociationMixin<Organization>;
    // Consumer belongsTo User via user_id
    user!: User;
    getUser!: Sequelize.BelongsToGetAssociationMixin<User>;
    setUser!: Sequelize.BelongsToSetAssociationMixin<User, UserId>;
    createUser!: Sequelize.BelongsToCreateAssociationMixin<User>;

    static initModel(sequelize: Sequelize.Sequelize): typeof Consumer {
        return Consumer.init(
            {
                consumer_id: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                },
                user_id: {
                    type: DataTypes.BLOB,
                    allowNull: true,
                    references: {
                        model: "User",
                        key: "user_id",
                    },
                },
                corp_id: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: "Corporation",
                        key: "corp_id",
                    },
                },
                orgn_id: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: "Organization",
                        key: "orgn_id",
                    },
                },
                consumer_type: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                    validate: {
                        isIn: [Object.values(ConsumerEnum.CONSUMER_ENUM)],
                    },
                },
                consumer_email: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                    validate: {
                        isEmail: true,
                    },
                },
                consumer_verified: {
                    type: DataTypes.DATE,
                    allowNull: true,
                    comment:
                        "Consumer can have three types \n\nnormal: normal user\ncorp: user works at corporation / so corporation entity can have multiple providers\norgn: user works at organization /  ``",
                },
                phone_number: {
                    type: DataTypes.STRING(32),
                    allowNull: false,
                },
            },
            {
                sequelize,
                tableName: "Consumer",
                timestamps: true,
                createdAt: "created_at",
                updatedAt: "updated_at",
                indexes: [
                    {
                        name: "PRIMARY",
                        unique: true,
                        using: "BTREE",
                        fields: [{ name: "consumer_id" }],
                    },
                    {
                        name: "user_id_idx",
                        using: "BTREE",
                        fields: [{ name: "user_id" }],
                    },
                    {
                        name: "corp_id_idx",
                        using: "BTREE",
                        fields: [{ name: "corp_id" }],
                    },
                    {
                        name: "orgn_id_idx",
                        using: "BTREE",
                        fields: [{ name: "orgn_id" }],
                    },
                ],

                hooks: {
                    beforeCreate: async (consumer, option) => {
                        const hasSameIdentity = await sequelize.models.Consumer.count({
                            where: {
                                [Op.and]: [
                                    { user_id: consumer.getDataValue("user_id") },
                                    { consumer_type: consumer.getDataValue("consumer_type") },
                                ],
                            },
                        });
                        console.error(hasSameIdentity);
                        if (hasSameIdentity !== 0) {
                            throw new Sequelize.ValidationError(
                                `Duplicated consumer type for one user: ${JSON.stringify(consumer.toJSON())}`,
                                [],
                            );
                        }
                    },
                },
            },
        );
    }
}
