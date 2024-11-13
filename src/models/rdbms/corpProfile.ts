import { DataTypes, Model } from "sequelize";
import corpProfileSequelize from "../dbconfig/corpProfileDatabase";

class CorpProfile extends Model {
    public id!: number;
    public name!: string;
    public nationality!: string;
    public corpDomain!: string;
    public corpAddress!: string;
    public ceoName!: string;
    public phoneNumber!: string;
    public corpNum!: string;
    public bzNum!: string;
    public bizStartedAt!: string;
    public status!: string;
    public bizType!: string;
    public logo!: string;
}

CorpProfile.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        nationality: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        corpDomain: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        corpAddress: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        ceoName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        corpNum: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        bzNum: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        bizStartedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("active", "inactive", "pending"),
            allowNull: false,
            defaultValue: "active",
        },
        bizType: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        logo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize: corpProfileSequelize,
        tableName: "corp_profiles",
    },
);

export default CorpProfile;
