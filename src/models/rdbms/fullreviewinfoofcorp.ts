import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";

export interface fullreviewinfoofcorpAttributes {
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
    corp_status?: number;
    biz_type?: string;
    logo_image?: string;
    site_url?: string;
    reviews?: object;
    requests?: object;
}

export type fullreviewinfoofcorpOptionalAttributes =
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
    | "site_url"
    | "reviews"
    | "requests";
export type fullreviewinfoofcorpCreationAttributes = Optional<
    fullreviewinfoofcorpAttributes,
    fullreviewinfoofcorpOptionalAttributes
>;

export class fullreviewinfoofcorp
    extends Model<
        fullreviewinfoofcorpAttributes,
        fullreviewinfoofcorpCreationAttributes
    >
    implements fullreviewinfoofcorpAttributes
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
    corp_status?: number;
    biz_type?: string;
    logo_image?: string;
    site_url?: string;
    reviews?: object;
    requests?: object;

    static initModel(
        sequelize: Sequelize.Sequelize,
    ): typeof fullreviewinfoofcorp {
        return fullreviewinfoofcorp.init(
            {
                corp_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
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
                    type: DataTypes.BIGINT.UNSIGNED,
                    allowNull: true,
                },
                biz_started_at: {
                    type: DataTypes.DATEONLY,
                    allowNull: true,
                },
                corp_status: {
                    type: DataTypes.TINYINT,
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
                reviews: {
                    type: DataTypes.JSON,
                    allowNull: true,
                },
                requests: {
                    type: DataTypes.JSON,
                    allowNull: true,
                },
            },
            {
                sequelize,
                tableName: "fullreviewinfoofcorp",
                timestamps: false,
            },
        );
    }
}
