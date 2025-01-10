import type { Sequelize } from "sequelize";
import { AcademicHistory as _AcademicHistory } from "./AcademicHistory";
import type { AcademicHistoryAttributes, AcademicHistoryCreationAttributes } from "./AcademicHistory";
import { Account as _Account } from "./Account";
import type { AccountAttributes, AccountCreationAttributes } from "./Account";
import { Consumer as _Consumer } from "./Consumer";
import type { ConsumerAttributes, ConsumerCreationAttributes } from "./Consumer";
import { Corporation as _Corporation } from "./Corporation";
import type { CorporationAttributes, CorporationCreationAttributes } from "./Corporation";
import { CorporationReview as _CorporationReview } from "./CorporationReview";
import type { CorporationReviewAttributes, CorporationReviewCreationAttributes } from "./CorporationReview";
import { ExamHistory as _ExamHistory } from "./ExamHistory";
import type { ExamHistoryAttributes, ExamHistoryCreationAttributes } from "./ExamHistory";
import { LanguageExam as _LanguageExam } from "./LanguageExam";
import type { LanguageExamAttributes, LanguageExamCreationAttributes } from "./LanguageExam";
import { Organization as _Organization } from "./Organization";
import type { OrganizationAttributes, OrganizationCreationAttributes } from "./Organization";
import { Provider as _Provider } from "./Provider";
import type { ProviderAttributes, ProviderCreationAttributes } from "./Provider";
import { Request as _Request } from "./Request";
import type { RequestAttributes, RequestCreationAttributes } from "./Request";
import { School as _School } from "./School";
import type { SchoolAttributes, SchoolCreationAttributes } from "./School";
import { Student as _Student } from "./Student";
import type { StudentAttributes, StudentCreationAttributes } from "./Student";
import { StudentReview as _StudentReview } from "./StudentReview";
import type { StudentReviewAttributes, StudentReviewCreationAttributes } from "./StudentReview";
import { User as _User } from "./User";
import type { UserAttributes, UserCreationAttributes } from "./User";
import { VerificationToken as _VerificationToken } from "./VerificationToken";
import type { VerificationTokenAttributes, VerificationTokenCreationAttributes } from "./VerificationToken";

export {
    _AcademicHistory as AcademicHistory,
    _Account as Account,
    _Consumer as Consumer,
    _Corporation as Corporation,
    _CorporationReview as CorporationReview,
    _ExamHistory as ExamHistory,
    _LanguageExam as LanguageExam,
    _Organization as Organization,
    _Provider as Provider,
    _Request as Request,
    _School as School,
    _Student as Student,
    _StudentReview as StudentReview,
    _User as User,
    _VerificationToken as VerificationToken,
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
    CorporationReviewAttributes,
    CorporationReviewCreationAttributes,
    ExamHistoryAttributes,
    ExamHistoryCreationAttributes,
    LanguageExamAttributes,
    LanguageExamCreationAttributes,
    OrganizationAttributes,
    OrganizationCreationAttributes,
    ProviderAttributes,
    ProviderCreationAttributes,
    RequestAttributes,
    RequestCreationAttributes,
    SchoolAttributes,
    SchoolCreationAttributes,
    StudentAttributes,
    StudentCreationAttributes,
    StudentReviewAttributes,
    StudentReviewCreationAttributes,
    UserAttributes,
    UserCreationAttributes,
    VerificationTokenAttributes,
    VerificationTokenCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
    const AcademicHistory = _AcademicHistory.initModel(sequelize);
    const Account = _Account.initModel(sequelize);
    const Consumer = _Consumer.initModel(sequelize);
    const Corporation = _Corporation.initModel(sequelize);
    const CorporationReview = _CorporationReview.initModel(sequelize);
    const ExamHistory = _ExamHistory.initModel(sequelize);
    const LanguageExam = _LanguageExam.initModel(sequelize);
    const Organization = _Organization.initModel(sequelize);
    const Provider = _Provider.initModel(sequelize);
    const Request = _Request.initModel(sequelize);
    const School = _School.initModel(sequelize);
    const Student = _Student.initModel(sequelize);
    const StudentReview = _StudentReview.initModel(sequelize);
    const User = _User.initModel(sequelize);
    const VerificationToken = _VerificationToken.initModel(sequelize);

    Request.belongsTo(Consumer, { as: "consumer", foreignKey: "consumer_id" });
    Consumer.hasMany(Request, { as: "Requests", foreignKey: "consumer_id" });
    Consumer.belongsTo(Corporation, { as: "corp", foreignKey: "corp_id" });
    Corporation.hasMany(Consumer, { as: "Consumers", foreignKey: "corp_id" });
    ExamHistory.belongsTo(LanguageExam, { as: "exam", foreignKey: "exam_id" });
    LanguageExam.hasMany(ExamHistory, { as: "ExamHistories", foreignKey: "exam_id" });
    Consumer.belongsTo(Organization, { as: "orgn", foreignKey: "orgn_id" });
    Organization.hasMany(Consumer, { as: "Consumers", foreignKey: "orgn_id" });
    Provider.belongsTo(Request, { as: "request", foreignKey: "request_id" });
    Request.hasMany(Provider, { as: "Providers", foreignKey: "request_id" });
    AcademicHistory.belongsTo(School, { as: "school", foreignKey: "school_id" });
    School.hasMany(AcademicHistory, { as: "AcademicHistories", foreignKey: "school_id" });
    AcademicHistory.belongsTo(Student, { as: "student", foreignKey: "student_id" });
    Student.hasMany(AcademicHistory, { as: "AcademicHistories", foreignKey: "student_id" });
    ExamHistory.belongsTo(Student, { as: "student", foreignKey: "student_id" });
    Student.hasMany(ExamHistory, { as: "ExamHistories", foreignKey: "student_id" });
    Provider.belongsTo(Student, { as: "student", foreignKey: "student_id" });
    Student.hasMany(Provider, { as: "Providers", foreignKey: "student_id" });
    Account.belongsTo(User, { as: "user", foreignKey: "user_id" });
    User.hasMany(Account, { as: "Accounts", foreignKey: "user_id" });
    Consumer.belongsTo(User, { as: "user", foreignKey: "user_id" });
    User.hasMany(Consumer, { as: "Consumers", foreignKey: "user_id" });
    Provider.belongsTo(User, { as: "user", foreignKey: "user_id" });
    User.hasMany(Provider, { as: "Providers", foreignKey: "user_id" });
    Student.belongsTo(User, { as: "user", foreignKey: "user_id" });
    User.hasOne(Student, { as: "Student", foreignKey: "user_id" });

    return {
        AcademicHistory: AcademicHistory,
        Account: Account,
        Consumer: Consumer,
        Corporation: Corporation,
        CorporationReview: CorporationReview,
        ExamHistory: ExamHistory,
        LanguageExam: LanguageExam,
        Organization: Organization,
        Provider: Provider,
        Request: Request,
        School: School,
        Student: Student,
        StudentReview: StudentReview,
        User: User,
        VerificationToken: VerificationToken,
    };
}
