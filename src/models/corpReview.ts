import { DataTypes, Model } from "sequelize";
import corpReviewSequelize from "../dbconfig/corpReviewDatabase";

class CorpReview extends Model {
    public id!: number;
    public requestURL!: string;
    public reviewText!: string;
    public prepRequirement!: string;
    public workAtmosphere!: string;
    public senseOfAchievement!: number;
    public workIntensity!: number;
    public paySatisfaction!: number;
}

CorpReview.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        requestURL: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        reviewText: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        prepRequirement: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        workAtmosphere: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        senseOfAchievement: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 10,
            },
        },
        workIntensity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 10,
            },
        },
        paySatisfaction: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 10,
            },
        },
    },
    {
        sequelize: corpReviewSequelize,
        tableName: "corp_reviews",
    },
);

export default CorpReview;
