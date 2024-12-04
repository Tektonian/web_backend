import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";
import type { Consumer, ConsumerId } from "./Consumer";

export interface CorporationAttributes {
    corp_id: number;
    corp_name: string;
    nationality: string;
    corp_domain?: string;
    ceo_name?: string;
    corp_address?: string;
    phone_number?: string;
    corp_num: number;
    biz_num?: number;
    biz_started_at?: string;
    corp_status?: string;
    biz_type?: string;
    logo_image?: string;
    site_url?: string;
}

export type CorporationPk = "corp_id";
export type CorporationId = Corporation[CorporationPk];
export type CorporationOptionalAttributes =
    | "corp_id"
    | "corp_domain"
    | "ceo_name"
    | "corp_address"
    | "phone_number"
    | "biz_num"
    | "biz_started_at"
    | "corp_status"
    | "biz_type"
    | "logo_image"
    | "site_url";
export type CorporationCreationAttributes = Optional<
    CorporationAttributes,
    CorporationOptionalAttributes
>;

export class Corporation
    extends Model<CorporationAttributes, CorporationCreationAttributes>
    implements CorporationAttributes
{
    corp_id!: number;
    corp_name!: string;
    nationality!: string;
    corp_domain?: string;
    ceo_name?: string;
    corp_address?: string;
    phone_number?: string;
    corp_num!: number;
    biz_num?: number;
    biz_started_at?: string;
    corp_status?: string;
    biz_type?: string;
    logo_image?: string;
    site_url?: string;

    // Corporation hasMany Consumer via corp_id
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

    static initModel(sequelize: Sequelize.Sequelize): typeof Corporation {
        return Corporation.init(
            {
                corp_id: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                },
                corp_name: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                nationality: {
                    type: DataTypes.STRING(4),
                    allowNull: false,
                },
                corp_domain: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                ceo_name: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                corp_address: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                phone_number: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                corp_num: {
                    type: DataTypes.BIGINT.UNSIGNED,
                    allowNull: false,
                },
                biz_num: {
                    type: DataTypes.INTEGER.UNSIGNED,
                    allowNull: true,
                },
                biz_started_at: {
                    type: DataTypes.DATEONLY,
                    allowNull: true,
                },
                corp_status: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                biz_type: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                logo_image: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                site_url: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
            },
            {
                sequelize,
                tableName: "Corporation",
                timestamps: false,
                indexes: [
                    {
                        name: "PRIMARY",
                        unique: true,
                        using: "BTREE",
                        fields: [{ name: "corp_id" }],
                    },
                ],
            },
        );
    }
}
