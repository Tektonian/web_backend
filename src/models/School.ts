import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { AcademicHistory, AcademicHistoryId } from './AcademicHistory';

export interface SchoolAttributes {
  school_id: number;
  school_name_glb?: string;
  nationality?: string;
  coordinate?: any;
}

export type SchoolPk = "school_id";
export type SchoolId = School[SchoolPk];
export type SchoolOptionalAttributes = "school_name_glb" | "nationality" | "coordinate";
export type SchoolCreationAttributes = Optional<SchoolAttributes, SchoolOptionalAttributes>;

export class School extends Model<SchoolAttributes, SchoolCreationAttributes> implements SchoolAttributes {
  school_id!: number;
  school_name_glb?: string;
  nationality?: string;
  coordinate?: any;

  // School hasMany AcademicHistory via school_id
  AcademicHistories!: AcademicHistory[];
  getAcademicHistories!: Sequelize.HasManyGetAssociationsMixin<AcademicHistory>;
  setAcademicHistories!: Sequelize.HasManySetAssociationsMixin<AcademicHistory, AcademicHistoryId>;
  addAcademicHistory!: Sequelize.HasManyAddAssociationMixin<AcademicHistory, AcademicHistoryId>;
  addAcademicHistories!: Sequelize.HasManyAddAssociationsMixin<AcademicHistory, AcademicHistoryId>;
  createAcademicHistory!: Sequelize.HasManyCreateAssociationMixin<AcademicHistory>;
  removeAcademicHistory!: Sequelize.HasManyRemoveAssociationMixin<AcademicHistory, AcademicHistoryId>;
  removeAcademicHistories!: Sequelize.HasManyRemoveAssociationsMixin<AcademicHistory, AcademicHistoryId>;
  hasAcademicHistory!: Sequelize.HasManyHasAssociationMixin<AcademicHistory, AcademicHistoryId>;
  hasAcademicHistories!: Sequelize.HasManyHasAssociationsMixin<AcademicHistory, AcademicHistoryId>;
  countAcademicHistories!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof School {
    return School.init({
    school_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    school_name_glb: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    nationality: {
      type: DataTypes.STRING(4),
      allowNull: true
    },
    coordinate: {
      type: "MULTIPOINT",
      allowNull: true,
      comment: "School can have multiple campus\n"
    }
  }, {
    sequelize,
    tableName: 'School',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "school_id" },
        ]
      },
    ]
  });
  }
}
