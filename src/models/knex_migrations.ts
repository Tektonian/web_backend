import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface knex_migrationsAttributes {
  id: number;
  name?: string;
  batch?: number;
  migration_time?: Date;
}

export type knex_migrationsPk = "id";
export type knex_migrationsId = knex_migrations[knex_migrationsPk];
export type knex_migrationsOptionalAttributes = "id" | "name" | "batch" | "migration_time";
export type knex_migrationsCreationAttributes = Optional<knex_migrationsAttributes, knex_migrationsOptionalAttributes>;

export class knex_migrations extends Model<knex_migrationsAttributes, knex_migrationsCreationAttributes> implements knex_migrationsAttributes {
  id!: number;
  name?: string;
  batch?: number;
  migration_time?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof knex_migrations {
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
