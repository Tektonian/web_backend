import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ExamHistory, ExamHistoryId } from './ExamHistory';

export interface LanguageExamAttributes {
  exam_id: number;
  exam_name_glb?: object;
  exam_result_type?: string;
  exam_results?: object;
  exam_level?: object;
}

export type LanguageExamPk = "exam_id";
export type LanguageExamId = LanguageExam[LanguageExamPk];
export type LanguageExamOptionalAttributes = "exam_name_glb" | "exam_result_type" | "exam_results" | "exam_level";
export type LanguageExamCreationAttributes = Optional<LanguageExamAttributes, LanguageExamOptionalAttributes>;

export class LanguageExam extends Model<LanguageExamAttributes, LanguageExamCreationAttributes> implements LanguageExamAttributes {
  exam_id!: number;
  exam_name_glb?: object;
  exam_result_type?: string;
  exam_results?: object;
  exam_level?: object;

  // LanguageExam hasMany ExamHistory via exam_id
  ExamHistories!: ExamHistory[];
  getExamHistories!: Sequelize.HasManyGetAssociationsMixin<ExamHistory>;
  setExamHistories!: Sequelize.HasManySetAssociationsMixin<ExamHistory, ExamHistoryId>;
  addExamHistory!: Sequelize.HasManyAddAssociationMixin<ExamHistory, ExamHistoryId>;
  addExamHistories!: Sequelize.HasManyAddAssociationsMixin<ExamHistory, ExamHistoryId>;
  createExamHistory!: Sequelize.HasManyCreateAssociationMixin<ExamHistory>;
  removeExamHistory!: Sequelize.HasManyRemoveAssociationMixin<ExamHistory, ExamHistoryId>;
  removeExamHistories!: Sequelize.HasManyRemoveAssociationsMixin<ExamHistory, ExamHistoryId>;
  hasExamHistory!: Sequelize.HasManyHasAssociationMixin<ExamHistory, ExamHistoryId>;
  hasExamHistories!: Sequelize.HasManyHasAssociationsMixin<ExamHistory, ExamHistoryId>;
  countExamHistories!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof LanguageExam {
    return LanguageExam.init({
    exam_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    exam_name_glb: {
      type: DataTypes.JSON,
      allowNull: true
    },
    exam_result_type: {
      type: DataTypes.STRING(7),
      allowNull: true,
      comment: "There are two types of ‘exam results’\nThe Class type and Score type\n\nFor example, TOEFL (one of the English test) is score type \nBut TOEIC (one of the Korean test) is class type "
    },
    exam_results: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "If a test is class type then the classes of a result of the test should be listed"
    },
    exam_level: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Exam level should contain normalized score of the test"
    }
  }, {
    sequelize,
    tableName: 'LanguageExam',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "exam_id" },
        ]
      },
    ]
  });
  }
}
