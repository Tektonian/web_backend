import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface examhistorywithlanguageexamAttributes {
  student_id: number;
  exam_result?: string;
  exam_id: number;
  exam_name_glb?: object;
  exam_result_type?: string;
  exam_results?: object;
  exam_level?: object;
  lang_country_code?: string;
}

export type examhistorywithlanguageexamOptionalAttributes = "exam_result" | "exam_name_glb" | "exam_result_type" | "exam_results" | "exam_level" | "lang_country_code";
export type examhistorywithlanguageexamCreationAttributes = Optional<examhistorywithlanguageexamAttributes, examhistorywithlanguageexamOptionalAttributes>;

export class examhistorywithlanguageexam extends Model<examhistorywithlanguageexamAttributes, examhistorywithlanguageexamCreationAttributes> implements examhistorywithlanguageexamAttributes {
  student_id!: number;
  exam_result?: string;
  exam_id!: number;
  exam_name_glb?: object;
  exam_result_type?: string;
  exam_results?: object;
  exam_level?: object;
  lang_country_code?: string;


  static initModel(sequelize: Sequelize.Sequelize): typeof examhistorywithlanguageexam {
    return examhistorywithlanguageexam.init({
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    exam_result: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    exam_id: {
      type: DataTypes.INTEGER,
      allowNull: false
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
    },
    lang_country_code: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'examhistorywithlanguageexam',
    timestamps: false
  });
  }
}
