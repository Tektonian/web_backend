import { DataTypes, Model } from 'sequelize';
export class knex_migrations_lock extends Model {
    index;
    is_locked;
    static initModel(sequelize) {
        return knex_migrations_lock.init({
            index: {
                autoIncrement: true,
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                primaryKey: true
            },
            is_locked: {
                type: DataTypes.INTEGER,
                allowNull: true
            }
        }, {
            sequelize,
            tableName: 'knex_migrations_lock',
            timestamps: false,
            indexes: [
                {
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "index" },
                    ]
                },
            ]
        });
    }
}
