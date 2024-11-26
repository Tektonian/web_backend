import { DataTypes, Model } from 'sequelize';
export class knex_migrations extends Model {
    id;
    name;
    batch;
    migration_time;
    static initModel(sequelize) {
        return knex_migrations.init({
            id: {
                autoIncrement: true,
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            batch: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            migration_time: {
                type: DataTypes.DATE,
                allowNull: true
            }
        }, {
            sequelize,
            tableName: 'knex_migrations',
            timestamps: false,
            indexes: [
                {
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "id" },
                    ]
                },
            ]
        });
    }
}
