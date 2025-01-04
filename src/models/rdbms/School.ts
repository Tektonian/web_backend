import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";
import type { AcademicHistory, AcademicHistoryId } from "./AcademicHistory";
import { CountryCodeEnum } from "api_spec/enum";

export interface SchoolAttributes {
    school_id: number;
    school_name: string;
    school_name_glb: { [country_code in CountryCodeEnum.COUNTRY_CODE_ENUM]?: string };
    country_code: string;
    address: string;
    coordinate: any;
    hompage_url?: string;
    email_domain?: string;
    phone_number?: string;
}

export type SchoolPk = "school_id";
export type SchoolId = School[SchoolPk];
export type SchoolOptionalAttributes = "hompage_url" | "email_domain" | "phone_number";
export type SchoolCreationAttributes = Optional<SchoolAttributes, SchoolOptionalAttributes>;

export class School extends Model<SchoolAttributes, SchoolCreationAttributes> implements SchoolAttributes {
    school_id!: number;
    school_name!: string;
    school_name_glb!: { [country_code in CountryCodeEnum.COUNTRY_CODE_ENUM]?: string };
    country_code!: string;
    address!: string;
    coordinate!: any;
    hompage_url?: string;
    email_domain?: string;
    phone_number?: string;

    // School hasMany AcademicHistory via school_id
    AcademicHistories!: AcademicHistory[];
    getAcademicHistories!: Sequelize.HasManyGetAssociationsMixin<AcademicHistory>;
    setAcademicHistories!: Sequelize.HasManySetAssociationsMixin<AcademicHistory, AcademicHistoryId>;
    addAcademicHistory!: Sequelize.HasManyAddAssociationMixin<AcademicHistory, AcademicHistoryId>;
    addAcademicHistories!: Sequelize.HasManyAddAssociationsMixin<AcademicHistory, AcademicHistoryId>;
    createAcademicHistory!: Sequelize.HasManyCreateAssociationMixin<AcademicHistory>;
    removeAcademicHistory!: Sequelize.HasManyRemoveAssociationMixin<AcademicHistory, AcademicHistoryId>;
    removeAcademicHistories!: Sequelize.HasManyRemoveAssociationsMixin<AcademicHistory, AcademicHistoryId>;
    hasAcademicHistory!: Sequelize.HasManyHasAssociationMixin<AcademicHistory, AcademicHistoryId>;
    hasAcademicHistories!: Sequelize.HasManyHasAssociationsMixin<AcademicHistory, AcademicHistoryId>;
    countAcademicHistories!: Sequelize.HasManyCountAssociationsMixin;

    static initModel(sequelize: Sequelize.Sequelize): typeof School {
        return School.init(
            {
                school_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                },
                school_name: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                school_name_glb: {
                    type: DataTypes.JSON,
                    allowNull: false,
                },
                country_code: {
                    type: DataTypes.STRING(4),
                    allowNull: false,
                },
                address: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                coordinate: {
                    type: DataTypes.GEOMETRY,
                    allowNull: false,
                    comment: "School can have multiple campus\n",
                },
                hompage_url: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                email_domain: {
                    type: DataTypes.STRING(45),
                    allowNull: true,
                },
                phone_number: {
                    type: DataTypes.STRING(45),
                    allowNull: true,
                },
            },
            {
                sequelize,
                tableName: "School",
                timestamps: false,
                indexes: [
                    {
                        name: "PRIMARY",
                        unique: true,
                        using: "BTREE",
                        fields: [{ name: "school_id" }],
                    },
                ],
            },
        );
    }
}
