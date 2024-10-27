import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { LanguageExam, LanguageExamId } from './LanguageExam';
import type { Student, StudentId } from './Student';

export interface ExamHistoryAttributes {
  id: number;
  student_id: number;
  exam_id: number;
  exam_result?: string;
}

export type ExamHistoryPk = "id";
export type ExamHistoryId = ExamHistory[ExamHistoryPk];
export type ExamHistoryOptionalAttributes = "id" | "exam_result";
export type ExamHistoryCreationAttributes = Optional<ExamHistoryAttributes, ExamHistoryOptionalAttributes>;

export class ExamHistory extends Model<ExamHistoryAttributes, ExamHistoryCreationAttributes> implements ExamHistoryAttributes {
  id!: number;
  student_id!: number;
  exam_id!: number;
  exam_result?: string;

  // ExamHistory belongsTo LanguageExam via exam_id
  exam!: LanguageExam;
  getExam!: Sequelize.BelongsToGetAssociationMixin<LanguageExam>;
  setExam!: Sequelize.BelongsToSetAssociationMixin<LanguageExam, LanguageExamId>;
  createExam!: Sequelize.BelongsToCreateAssociationMixin<LanguageExam>;
  // ExamHistory belongsTo Student via student_id
  student!: Student;
  getStudent!: Sequelize.BelongsToGetAssociationMixin<Student>;
  setStudent!: Sequelize.BelongsToSetAssociationMixin<Student, StudentId>;
  createStudent!: Sequelize.BelongsToCreateAssociationMixin<Student>;

  static initModel(sequelize: Sequelize.Sequelize): typeof ExamHistory {
    return ExamHistory.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Student',
        key: 'student_id'
      }
    },
    exam_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'LanguageExam',
        key: 'exam_id'
      }
    },
    exam_result: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ExamHistory',
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
      {
        name: "student_id_idx",
        using: "BTREE",
        fields: [
          { name: "student_id" },
        ]
      },
      {
        name: "exam_id_idx",
        using: "BTREE",
        fields: [
          { name: "exam_id" },
        ]
      },
    ]
  });
  }
}
