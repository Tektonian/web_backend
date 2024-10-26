import { DataTypes, Model } from "sequelize";
import requestInfoSequelize from "../dbconfig/requestInfoDatabase";

interface Address {
    street: string;
    city: string;
    prefecture: string;
    postalcode: string;
    country: string;
}

class RequestInfo extends Model {
    public id!: number;
    public title!: string;
    public memberNum!: number;
    public payNum!: number;
    public currency!: string;
    public subtitle!: string;
    public content!: string;
    public wishlist!: string;
    public date!: string;
    public address!: Address;
    public foodExpense!: boolean;
    public transportExpense!: boolean;
    public prepMaterial!: string;
}

RequestInfo.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        memberNum: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        payNum: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        subtitle: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        wishlist: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        address: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        foodExpense: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        transportExpense: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        prepMaterial: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize: requestInfoSequelize,
        tableName: "request_info",
    },
);

export default RequestInfo;
