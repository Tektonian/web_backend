import { DataTypes, Model } from 'sequelize';
export class Corporation extends Model {
    corp_id;
    corp_name;
    nationality;
    corp_domain;
    ceo_name;
    corp_address;
    phone_number;
    corp_num;
    biz_num;
    biz_started_at;
    status;
    biz_type;
    logo_image;
    site_url;
    // Corporation hasMany Consumer via corp_id
    Consumers;
    getConsumers;
    setConsumers;
    addConsumer;
    addConsumers;
    createConsumer;
    removeConsumer;
    removeConsumers;
    hasConsumer;
    hasConsumers;
    countConsumers;
    static initModel(sequelize) {
        return Corporation.init({
            corp_id: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            corp_name: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            nationality: {
                type: DataTypes.STRING(4),
                allowNull: false
            },
            corp_domain: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            ceo_name: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            corp_address: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            phone_number: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            corp_num: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false
            },
            biz_num: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true
            },
            biz_started_at: {
                type: DataTypes.DATEONLY,
                allowNull: true
            },
            status: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            biz_type: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            logo_image: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            site_url: {
                type: DataTypes.STRING(255),
                allowNull: true
            }
        }, {
            sequelize,
            tableName: 'Corporation',
            timestamps: false,
            indexes: [
                {
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "corp_id" },
                    ]
                },
            ]
        });
    }
}
