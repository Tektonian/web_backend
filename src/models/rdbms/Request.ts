import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";
import type { Consumer, ConsumerId } from "./Consumer";
import type { Provider, ProviderId } from "./Provider";
import { RequestEnum } from "@mesh/api_spec/enum";

export interface RequestAttributes {
    request_id: number;
    consumer_id: number;
    title: string;
    head_count: number;
    reward_price: number;
    currency: string;
    content: string;
    are_needed?: string[];
    are_required?: string[];
    start_date: string;
    end_date: string;
    address?: string;
    address_coordinate?: any;
    provide_food: boolean;
    provide_trans_exp: boolean;
    prep_material?: string[];
    request_status?: RequestEnum.REQUEST_STATUS_ENUM;
    start_time: string;
    end_time: string;
    created_at?: Date;
    updated_at?: Date;
    corp_id?: number;
    orgn_id?: number;
}

export type RequestPk = "request_id";
export type RequestId = Request[RequestPk];
export type RequestOptionalAttributes =
    | "request_id"
    | "are_needed"
    | "are_required"
    | "address"
    | "address_coordinate"
    | "provide_food"
    | "provide_trans_exp"
    | "prep_material"
    | "request_status"
    | "created_at"
    | "updated_at"
    | "corp_id"
    | "orgn_id";
export type RequestCreationAttributes = Optional<RequestAttributes, RequestOptionalAttributes>;

export class Request extends Model<RequestAttributes, RequestCreationAttributes> implements RequestAttributes {
    request_id!: number;
    consumer_id!: number;
    title!: string;
    head_count!: number;
    reward_price!: number;
    currency!: string;
    content!: string;
    are_needed?: string[];
    are_required?: string[];
    start_date!: string;
    end_date!: string;
    address?: string;
    address_coordinate?: any;
    provide_food!: boolean;
    provide_trans_exp!: boolean;
    prep_material?: string[];
    request_status?: RequestEnum.REQUEST_STATUS_ENUM;
    start_time!: string;
    end_time!: string;
    created_at?: Date;
    updated_at?: Date;
    corp_id?: number;
    orgn_id?: number;

    // Request belongsTo Consumer via consumer_id
    consumer!: Consumer;
    getConsumer!: Sequelize.BelongsToGetAssociationMixin<Consumer>;
    setConsumer!: Sequelize.BelongsToSetAssociationMixin<Consumer, ConsumerId>;
    createConsumer!: Sequelize.BelongsToCreateAssociationMixin<Consumer>;
    // Request hasMany Provider via request_id
    Providers!: Provider[];
    getProviders!: Sequelize.HasManyGetAssociationsMixin<Provider>;
    setProviders!: Sequelize.HasManySetAssociationsMixin<Provider, ProviderId>;
    addProvider!: Sequelize.HasManyAddAssociationMixin<Provider, ProviderId>;
    addProviders!: Sequelize.HasManyAddAssociationsMixin<Provider, ProviderId>;
    createProvider!: Sequelize.HasManyCreateAssociationMixin<Provider>;
    removeProvider!: Sequelize.HasManyRemoveAssociationMixin<Provider, ProviderId>;
    removeProviders!: Sequelize.HasManyRemoveAssociationsMixin<Provider, ProviderId>;
    hasProvider!: Sequelize.HasManyHasAssociationMixin<Provider, ProviderId>;
    hasProviders!: Sequelize.HasManyHasAssociationsMixin<Provider, ProviderId>;
    countProviders!: Sequelize.HasManyCountAssociationsMixin;

    static initModel(sequelize: Sequelize.Sequelize): typeof Request {
        return Request.init(
            {
                request_id: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                },
                consumer_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: "Consumer",
                        key: "consumer_id",
                    },
                },
                title: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                head_count: {
                    type: DataTypes.TINYINT.UNSIGNED,
                    allowNull: false,
                },
                reward_price: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                currency: {
                    type: DataTypes.STRING(2),
                    allowNull: false,
                },
                content: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                are_needed: {
                    type: DataTypes.JSON,
                    allowNull: true,
                    validate: {
                        isStringArray(value: any[]) {
                            for (const item of value) {
                                if (typeof item !== "string") {
                                    throw new Error("Wrong item founded");
                                }
                            }
                        },
                    },
                },
                are_required: {
                    type: DataTypes.JSON,
                    allowNull: true,
                    validate: {
                        isStringArray(value: any[]) {
                            for (const item of value) {
                                if (typeof item !== "string") {
                                    throw new Error("Wrong item founded");
                                }
                            }
                        },
                    },
                },
                start_date: {
                    type: DataTypes.DATEONLY,
                    allowNull: false,
                },
                end_date: {
                    type: DataTypes.DATEONLY,
                    allowNull: false,
                },
                address: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                address_coordinate: {
                    type: DataTypes.GEOMETRY,
                    allowNull: true,
                },
                provide_food: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                provide_trans_exp: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                prep_material: {
                    type: DataTypes.JSON,
                    allowNull: true,
                    validate: {
                        isStringArray(value: any[]) {
                            for (const item of value) {
                                if (typeof item !== "string") {
                                    throw new Error("Wrong item founded");
                                }
                            }
                        },
                    },
                },
                request_status: {
                    type: DataTypes.TINYINT,
                    allowNull: true,
                    comment:
                        "There could be various statuses of a request.\n\nFor example\n\nPosted: consumer wrote a request but not paid\nPaid: consumer paid for a request\nOutdated: No provider(s) contracted with a consumer\nContracted: provider(s) contracted with a consumer\nFinished: work has been done!\nFailed: Contraction didn’t work properly\n",
                    validate: {
                        isIn: [Object.values(RequestEnum.REQUEST_STATUS_ENUM)],
                    },
                    defaultValue: RequestEnum.REQUEST_STATUS_ENUM.POSTED,
                },
                start_time: {
                    type: DataTypes.TIME,
                    allowNull: false,
                },
                end_time: {
                    type: DataTypes.TIME,
                    allowNull: false,
                },
                corp_id: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    comment: "Have no idea that this field could be utilized late;;",
                },
                orgn_id: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    comment: "Have no idea that this field could be utilized late;;",
                },
            },
            {
                sequelize,
                tableName: "Request",
                timestamps: true,
                createdAt: "created_at",
                updatedAt: "updated_at",
                indexes: [
                    {
                        name: "PRIMARY",
                        unique: true,
                        using: "BTREE",
                        fields: [{ name: "request_id" }],
                    },
                    {
                        name: "consumer_id_idx",
                        using: "BTREE",
                        fields: [{ name: "consumer_id" }],
                    },
                ],
            },
        );
    }
}
