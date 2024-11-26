import { DataTypes, Model } from "sequelize";
export class requestofcorporation extends Model {
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
    created_at;
    status;
    start_time;
    end_time;
    corp_id;
    corp_name;
    corp_domain;
    nationality;
    corp_address;
    phone_number;
    logo_image;
    site_url;
    static initModel(sequelize) {
        return requestofcorporation.init({
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
                allowNull: false,
                defaultValue: 0,
            },
            corp_name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            corp_domain: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            nationality: {
                type: DataTypes.STRING(4),
                allowNull: false,
            },
            corp_address: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            phone_number: {
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
        }, {
            sequelize,
            tableName: "requestofcorporation",
            timestamps: true,
        });
    }
}
