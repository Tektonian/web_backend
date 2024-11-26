import { DataTypes, Model } from "sequelize";
export class Request extends Model {
    request_id;
    consumer_id;
    title;
    subtitle;
    head_count;
    reward_price;
    currency;
    content;
    are_needed;
    are_required;
    date;
    address;
    address_coordinate;
    provide_food;
    provide_trans_exp;
    prep_material;
    status;
    start_time;
    end_time;
    created_at;
    updated_at;
    corp_id;
    orgn_id;
    // Request belongsTo Consumer via consumer_id
    consumer;
    getConsumer;
    setConsumer;
    createConsumer;
    static initModel(sequelize) {
        return Request.init({
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
            date: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
            address: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            address_coordinate: {
                type: DataTypes.GEOMETRY("POINT"),
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
                comment: "There could be various statuses of a request.\n\nFor example\n\nPosted: consumer wrote a request but not paid\nPaid: consumer paid for a request\nOutdated: No provider(s) contracted with a consumer\nContracted: provider(s) contracted with a consumer\nFinished: work has been done!\nFailed: Contraction didn’t work properly\n",
            },
            start_time: {
                type: DataTypes.TIME,
                allowNull: true,
            },
            end_time: {
                type: DataTypes.TIME,
                allowNull: true,
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
        }, {
            sequelize,
            tableName: "Request",
            timestamps: true,
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
        });
    }
}
