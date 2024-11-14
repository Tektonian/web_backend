import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { AcademicHistory, AcademicHistoryId } from './AcademicHistory';
import type { ExamHistory, ExamHistoryId } from './ExamHistory';
import type { User, UserId } from './User';

export interface StudentAttributes {
  student_id: number;
  user_id: any;
  name_glb: object;
  nationality: string;
  age: string;
  email_verified?: Date;
  phone_number: string;
  emergency_contact: string;
  gender: string;
  image?: string;
  has_car?: any;
  keyword_list?: object;
  created_at?: Date;
  updated_at?: Date;
}

export type StudentPk = "student_id";
export type StudentId = Student[StudentPk];
export type StudentOptionalAttributes = "student_id" | "email_verified" | "image" | "has_car" | "keyword_list" | "created_at" | "updated_at";
export type StudentCreationAttributes = Optional<StudentAttributes, StudentOptionalAttributes>;

export class Student extends Model<StudentAttributes, StudentCreationAttributes> implements StudentAttributes {
  student_id!: number;
  user_id!: any;
  name_glb!: object;
  nationality!: string;
  age!: string;
  email_verified?: Date;
  phone_number!: string;
  emergency_contact!: string;
  gender!: string;
  image?: string;
  has_car?: any;
  keyword_list?: object;
  created_at?: Date;
  updated_at?: Date;

  // Student hasMany AcademicHistory via student_id
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
  // Student hasMany ExamHistory via student_id
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
  // Student belongsTo User via user_id
  user!: User;
  getUser!: Sequelize.BelongsToGetAssociationMixin<User>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<User, UserId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<User>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Student {
    return Student.init({
    student_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.BLOB,
      allowNull: false,
      references: {
        model: 'User',
        key: 'user_id'
      }
    },
    name_glb: {
      type: DataTypes.JSON,
      allowNull: false
    },
    nationality: {
      type: DataTypes.STRING(4),
      allowNull: false
    },
    age: {
      type: DataTypes.STRING(4),
      allowNull: false
    },
    email_verified: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "email_verified field could be set if one of the `AcademicHistory` entity of students has been verified"
    },
    phone_number: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    emergency_contact: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    gender: {
      type: DataTypes.STRING(8),
      allowNull: false
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    has_car: {
      type: DataTypes.BLOB,
      allowNull: true
    },
    keyword_list: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Student',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "student_id" },
        ]
      },
      {
        name: "user_id_idx",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
  }
}
