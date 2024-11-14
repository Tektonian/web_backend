import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";

export interface requestofuserAttributes {
    user_id: any;
    username?: string;
    image?: string;
    consumer_type: string;
    consumer_email: string;
    phone_number: string;
    request_id: number;
    consumer_id: number;
    title: string;
    subtitle?: object;
    head_count?: number;
    reward_price: number;
    currency: string;
    content: string;
    are_needed?: object;
    are_required?: object;
    start_date?: string;
    end_date?: string;
    address?: string;
    address_coordinate?: any;
    provide_food?: any;
    provide_trans_exp?: any;
    prep_material?: object;
    created_at?: Date;
    status?: number;
    start_time?: string;
    end_time?: string;
}

export type requestofuserOptionalAttributes =
    | "user_id"
    | "username"
    | "image"
    | "request_id"
    | "subtitle"
    | "head_count"
    | "are_needed"
    | "are_required"
    | "start_date"
    | "end_date"
    | "address"
    | "address_coordinate"
    | "provide_food"
    | "provide_trans_exp"
    | "prep_material"
    | "created_at"
    | "status"
    | "start_time"
    | "end_time";
export type requestofuserCreationAttributes = Optional<
    requestofuserAttributes,
    requestofuserOptionalAttributes
>;

export class requestofuser
    extends Model<requestofuserAttributes, requestofuserCreationAttributes>
    implements requestofuserAttributes
{
    user_id!: any;
    username?: string;
    image?: string;
    consumer_type!: string;
    consumer_email!: string;
    phone_number!: string;
    request_id!: number;
    consumer_id!: number;
    title!: string;
    subtitle?: object;
    head_count?: number;
    reward_price!: number;
    currency!: string;
    content!: string;
    are_needed?: object;
    are_required?: object;
    start_date?: string;
    end_date?: string;
    address?: string;
    address_coordinate?: any;
    provide_food?: any;
    provide_trans_exp?: any;
    prep_material?: object;
    created_at?: Date;
    status?: number;
    start_time?: string;
    end_time?: string;

    static initModel(sequelize: Sequelize.Sequelize): typeof requestofuser {
        return requestofuser.init(
            {
                user_id: {
                    type: DataTypes.BLOB,
                    allowNull: false,
                    defaultValue: Sequelize.Sequelize.literal(
                        "uuid_to_bin(uuid())",
                    ),
                },
                username: {
                    type: DataTypes.STRING(64),
                    allowNull: true,
                },
                image: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                consumer_type: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                consumer_email: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                phone_number: {
                    type: DataTypes.STRING(32),
                    allowNull: false,
                },
                request_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                },
                consumer_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                title: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                subtitle: {
                    type: DataTypes.JSON,
                    allowNull: true,
                },
                head_count: {
                    type: DataTypes.TINYINT.UNSIGNED,
                    allowNull: true,
                },
                reward_price: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                currency: {
                    type: DataTypes.STRING(7),
                    allowNull: false,
                },
                content: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                are_needed: {
                    type: DataTypes.JSON,
                    allowNull: true,
                },
                are_required: {
                    type: DataTypes.JSON,
                    allowNull: true,
                },
                start_date: {
                    type: DataTypes.DATEONLY,
                    allowNull: true,
                },
                end_date: {
                    type: DataTypes.DATEONLY,
                    allowNull: true,
                },
                address: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                address_coordinate: {
                    type: DataTypes.GEOGRAPHY,
                    allowNull: true,
                },
                provide_food: {
                    type: DataTypes.BLOB,
                    allowNull: true,
                },
                provide_trans_exp: {
                    type: DataTypes.BLOB,
                    allowNull: true,
                },
                prep_material: {
                    type: DataTypes.JSON,
                    allowNull: true,
                },
                status: {
                    type: DataTypes.TINYINT,
                    allowNull: true,
                    comment:
                        "There could be various statuses of a request.\n\nFor example\n\nPosted: consumer wrote a request but not paid\nPaid: consumer paid for a request\nOutdated: No provider(s) contracted with a consumer\nContracted: provider(s) contracted with a consumer\nFinished: work has been done!\nFailed: Contraction didn’t work properly\n",
                },
                start_time: {
                    type: DataTypes.TIME,
                    allowNull: true,
                },
                end_time: {
                    type: DataTypes.TIME,
                    allowNull: true,
                },
            },
            {
                sequelize,
                tableName: "requestofuser",
                timestamps: true,
            },
        );
    }
}
