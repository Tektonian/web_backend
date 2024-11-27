import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";

export interface CorporationReviewAttributes {
    id: number;
    consumer_id: number;
    student_id: number;
    corp_id: number;
    reqeust_id: number;
    request_url: string;
    review_text?: string;
    prep_requirement?: string;
    work_atmosphere?: string;
    sense_of_achive?: number;
    work_intensity?: number;
    pay_satisfaction?: number;
    CorporationReviewcol?: string;
    created_at?: Date;
    updated_at?: Date;
}

export type CorporationReviewPk = "id";
export type CorporationReviewId = CorporationReview[CorporationReviewPk];
export type CorporationReviewOptionalAttributes =
    | "id"
    | "review_text"
    | "prep_requirement"
    | "work_atmosphere"
    | "sense_of_achive"
    | "work_intensity"
    | "pay_satisfaction"
    | "CorporationReviewcol"
    | "created_at"
    | "updated_at";
export type CorporationReviewCreationAttributes = Optional<
    CorporationReviewAttributes,
    CorporationReviewOptionalAttributes
>;

export class CorporationReview
    extends Model<
        CorporationReviewAttributes,
        CorporationReviewCreationAttributes
    >
    implements CorporationReviewAttributes
{
    id!: number;
    consumer_id!: number;
    student_id!: number;
    corp_id!: number;
    request_id!: number;
    request_url!: string;
    review_text?: string;
    prep_requirement?: string;
    work_atmosphere?: string;
    sense_of_achive?: number;
    work_intensity?: number;
    pay_satisfaction?: number;
    CorporationReviewcol?: string;
    created_at?: Date;
    updated_at?: Date;

    static initModel(sequelize: Sequelize.Sequelize): typeof CorporationReview {
        return CorporationReview.init(
            {
                id: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                },
                consumer_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                student_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                corp_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                request_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                request_url: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                review_text: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                prep_requirement: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                work_atmosphere: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                sense_of_achive: {
                    type: DataTypes.TINYINT,
                    allowNull: true,
                },
                work_intensity: {
                    type: DataTypes.TINYINT,
                    allowNull: true,
                },
                pay_satisfaction: {
                    type: DataTypes.TINYINT,
                    allowNull: true,
                },
                CorporationReviewcol: {
                    type: DataTypes.STRING(45),
                    allowNull: true,
                },
            },
            {
                sequelize,
                tableName: "CorporationReview",
                timestamps: false,
                indexes: [
                    {
                        name: "PRIMARY",
                        unique: true,
                        using: "BTREE",
                        fields: [{ name: "id" }],
                    },
                ],
            },
        );
    }
}
