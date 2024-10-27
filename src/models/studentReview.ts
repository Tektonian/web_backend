import { DataTypes, Model } from "sequelize";
import studentReviewSequelize from "../dbconfig/studentReviewDatabase";

class StudentReview extends Model {
    public id!: number;
    public requestURL!: string;
    public reviewText!: string;
    public latenessEval!: number;
    public activenessEval!: number;
    public diligenceEval!: number;
    public communicationEval!: number;
    public langProfEval!: number;
    public goalFulfillmentRate!: number;
    public reEmploymentIntent!: number;
    public pointOfPraise!: string;
    public pointOfImprovement!: string;
}

StudentReview.init(
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
        latenessEval: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 10,
            },
        },
        activenessEval: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 10,
            },
        },
        diligenceEval: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 10,
            },
        },
        communicationEval: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 10,
            },
        },
        langProfEval: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 10,
            },
        },
        goalFulfillmentRate: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 10,
            },
        },
        reEmploymentIntent: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0,
                max: 1,
            },
        },
        pointOfPraise: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        pointOfImprovement: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize: studentReviewSequelize,
        tableName: "student_reviews",
    },
);

export default StudentReview;
