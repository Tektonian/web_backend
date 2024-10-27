import type { Sequelize } from "sequelize";
import { AcademicHistory as _AcademicHistory } from "./AcademicHistory";
import type { AcademicHistoryAttributes, AcademicHistoryCreationAttributes } from "./AcademicHistory";
import { Account as _Account } from "./Account";
import type { AccountAttributes, AccountCreationAttributes } from "./Account";
import { Consumer as _Consumer } from "./Consumer";
import type { ConsumerAttributes, ConsumerCreationAttributes } from "./Consumer";
import { Corporation as _Corporation } from "./Corporation";
import type { CorporationAttributes, CorporationCreationAttributes } from "./Corporation";
import { ExamHistory as _ExamHistory } from "./ExamHistory";
import type { ExamHistoryAttributes, ExamHistoryCreationAttributes } from "./ExamHistory";
import { LanguageExam as _LanguageExam } from "./LanguageExam";
import type { LanguageExamAttributes, LanguageExamCreationAttributes } from "./LanguageExam";
import { Organization as _Organization } from "./Organization";
import type { OrganizationAttributes, OrganizationCreationAttributes } from "./Organization";
import { Request as _Request } from "./Request";
import type { RequestAttributes, RequestCreationAttributes } from "./Request";
import { School as _School } from "./School";
import type { SchoolAttributes, SchoolCreationAttributes } from "./School";
import { Student as _Student } from "./Student";
import type { StudentAttributes, StudentCreationAttributes } from "./Student";
import { User as _User } from "./User";
import type { UserAttributes, UserCreationAttributes } from "./User";
import { VerificationToken as _VerificationToken } from "./VerificationToken";
import type { VerificationTokenAttributes, VerificationTokenCreationAttributes } from "./VerificationToken";
import { knex_migrations as _knex_migrations } from "./knex_migrations";
import type { knex_migrationsAttributes, knex_migrationsCreationAttributes } from "./knex_migrations";
import { knex_migrations_lock as _knex_migrations_lock } from "./knex_migrations_lock";
import type { knex_migrations_lockAttributes, knex_migrations_lockCreationAttributes } from "./knex_migrations_lock";

export {
  _AcademicHistory as AcademicHistory,
  _Account as Account,
  _Consumer as Consumer,
  _Corporation as Corporation,
  _ExamHistory as ExamHistory,
  _LanguageExam as LanguageExam,
  _Organization as Organization,
  _Request as Request,
  _School as School,
  _Student as Student,
  _User as User,
  _VerificationToken as VerificationToken,
  _knex_migrations as knex_migrations,
  _knex_migrations_lock as knex_migrations_lock,
};

export type {
  AcademicHistoryAttributes,
  AcademicHistoryCreationAttributes,
  AccountAttributes,
  AccountCreationAttributes,
  ConsumerAttributes,
  ConsumerCreationAttributes,
  CorporationAttributes,
  CorporationCreationAttributes,
  ExamHistoryAttributes,
  ExamHistoryCreationAttributes,
  LanguageExamAttributes,
  LanguageExamCreationAttributes,
  OrganizationAttributes,
  OrganizationCreationAttributes,
  RequestAttributes,
  RequestCreationAttributes,
  SchoolAttributes,
  SchoolCreationAttributes,
  StudentAttributes,
  StudentCreationAttributes,
  UserAttributes,
  UserCreationAttributes,
  VerificationTokenAttributes,
  VerificationTokenCreationAttributes,
  knex_migrationsAttributes,
  knex_migrationsCreationAttributes,
  knex_migrations_lockAttributes,
  knex_migrations_lockCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const AcademicHistory = _AcademicHistory.initModel(sequelize);
  const Account = _Account.initModel(sequelize);
  const Consumer = _Consumer.initModel(sequelize);
  const Corporation = _Corporation.initModel(sequelize);
  const ExamHistory = _ExamHistory.initModel(sequelize);
  const LanguageExam = _LanguageExam.initModel(sequelize);
  const Organization = _Organization.initModel(sequelize);
  const Request = _Request.initModel(sequelize);
  const School = _School.initModel(sequelize);
  const Student = _Student.initModel(sequelize);
  const User = _User.initModel(sequelize);
  const VerificationToken = _VerificationToken.initModel(sequelize);
  const knex_migrations = _knex_migrations.initModel(sequelize);
  const knex_migrations_lock = _knex_migrations_lock.initModel(sequelize);

  Request.belongsTo(Consumer, { as: "consumer", foreignKey: "consumer_id"});
  Consumer.hasMany(Request, { as: "Requests", foreignKey: "consumer_id"});
  Consumer.belongsTo(Corporation, { as: "corp", foreignKey: "corp_id"});
  Corporation.hasMany(Consumer, { as: "Consumers", foreignKey: "corp_id"});
  ExamHistory.belongsTo(LanguageExam, { as: "exam", foreignKey: "exam_id"});
  LanguageExam.hasMany(ExamHistory, { as: "ExamHistories", foreignKey: "exam_id"});
  Consumer.belongsTo(Organization, { as: "orgn", foreignKey: "orgn_id"});
  Organization.hasMany(Consumer, { as: "Consumers", foreignKey: "orgn_id"});
  AcademicHistory.belongsTo(School, { as: "school", foreignKey: "school_id"});
  School.hasMany(AcademicHistory, { as: "AcademicHistories", foreignKey: "school_id"});
  AcademicHistory.belongsTo(Student, { as: "student", foreignKey: "student_id"});
  Student.hasMany(AcademicHistory, { as: "AcademicHistories", foreignKey: "student_id"});
  ExamHistory.belongsTo(Student, { as: "student", foreignKey: "student_id"});
  Student.hasMany(ExamHistory, { as: "ExamHistories", foreignKey: "student_id"});
  Account.belongsTo(User, { as: "user", foreignKey: "user_id"});
  User.hasMany(Account, { as: "Accounts", foreignKey: "user_id"});
  Consumer.belongsTo(User, { as: "user", foreignKey: "user_id"});
  User.hasMany(Consumer, { as: "Consumers", foreignKey: "user_id"});
  Student.belongsTo(User, { as: "user", foreignKey: "user_id"});
  User.hasMany(Student, { as: "Students", foreignKey: "user_id"});

  return {
    AcademicHistory: AcademicHistory,
    Account: Account,
    Consumer: Consumer,
    Corporation: Corporation,
    ExamHistory: ExamHistory,
    LanguageExam: LanguageExam,
    Organization: Organization,
    Request: Request,
    School: School,
    Student: Student,
    User: User,
    VerificationToken: VerificationToken,
    knex_migrations: knex_migrations,
    knex_migrations_lock: knex_migrations_lock,
  };
}
