import { DataTypes, Model } from 'sequelize';
export class Organization extends Model {
    orgn_id;
    orgn_code;
    nationality;
    full_name;
    short_name;
    status;
    phone_number;
    site_url;
    orgn_type;
    // Organization hasMany Consumer via orgn_id
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
        return Organization.init({
            orgn_id: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            orgn_code: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true
            },
            nationality: {
                type: DataTypes.STRING(4),
                allowNull: false
            },
            full_name: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            short_name: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            status: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            phone_number: {
                type: DataTypes.STRING(32),
                allowNull: true
            },
            site_url: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            orgn_type: {
                type: DataTypes.STRING(255),
                allowNull: true
            }
        }, {
            sequelize,
            tableName: 'Organization',
            timestamps: false,
            indexes: [
                {
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "orgn_id" },
                    ]
                },
            ]
        });
    }
}
