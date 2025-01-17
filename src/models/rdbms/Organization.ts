import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";
import type { Consumer, ConsumerId } from "./Consumer";
import { CountryCodeEnum } from "@mesh/api_spec/enum";

export interface OrganizationAttributes {
    orgn_id: number;
    orgn_code?: number;
    nationality: CountryCodeEnum.COUNTRY_CODE_ENUM;
    full_name: string;
    short_name?: string;
    orgn_status?: string;
    phone_number?: string;
    site_url?: string;
    orgn_type?: string;
}

export type OrganizationPk = "orgn_id";
export type OrganizationId = Organization[OrganizationPk];
export type OrganizationOptionalAttributes =
    | "orgn_id"
    | "orgn_code"
    | "short_name"
    | "orgn_status"
    | "phone_number"
    | "site_url"
    | "orgn_type";
export type OrganizationCreationAttributes = Optional<OrganizationAttributes, OrganizationOptionalAttributes>;

export class Organization
    extends Model<OrganizationAttributes, OrganizationCreationAttributes>
    implements OrganizationAttributes
{
    orgn_id!: number;
    orgn_code?: number;
    nationality!: CountryCodeEnum.COUNTRY_CODE_ENUM;
    full_name!: string;
    short_name?: string;
    orgn_status?: string;
    phone_number?: string;
    site_url?: string;
    orgn_type?: string;

    // Organization hasMany Consumer via orgn_id
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

    static initModel(sequelize: Sequelize.Sequelize): typeof Organization {
        return Organization.init(
            {
                orgn_id: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                },
                orgn_code: {
                    type: DataTypes.INTEGER.UNSIGNED,
                    allowNull: true,
                },
                nationality: {
                    type: DataTypes.STRING(4),
                    allowNull: false,
                    validate: {
                        isIn: [Object.values(CountryCodeEnum.COUNTRY_CODE_ENUM)],
                    },
                },
                full_name: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                short_name: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                orgn_status: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                phone_number: {
                    type: DataTypes.STRING(32),
                    allowNull: true,
                },
                site_url: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                orgn_type: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
            },
            {
                sequelize,
                tableName: "Organization",
                timestamps: false,
                indexes: [
                    {
                        name: "PRIMARY",
                        unique: true,
                        using: "BTREE",
                        fields: [{ name: "orgn_id" }],
                    },
                ],
            },
        );
    }
}
