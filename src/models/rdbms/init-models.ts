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
import { academichistorywithschool as _academichistorywithschool } from "./academichistorywithschool";
import type {
    academichistorywithschoolAttributes,
    academichistorywithschoolCreationAttributes,
} from "./academichistorywithschool";
import { examhistorywithlanguageexam as _examhistorywithlanguageexam } from "./examhistorywithlanguageexam";
import type {
    examhistorywithlanguageexamAttributes,
    examhistorywithlanguageexamCreationAttributes,
} from "./examhistorywithlanguageexam";
import { fullreviewinfoofcorp as _fullreviewinfoofcorp } from "./fullreviewinfoofcorp";
import type { fullreviewinfoofcorpAttributes, fullreviewinfoofcorpCreationAttributes } from "./fullreviewinfoofcorp";
import { fullstudentprofile as _fullstudentprofile } from "./fullstudentprofile";
import type { fullstudentprofileAttributes, fullstudentprofileCreationAttributes } from "./fullstudentprofile";
import { requestofcorporation as _requestofcorporation } from "./requestofcorporation";
import type { requestofcorporationAttributes, requestofcorporationCreationAttributes } from "./requestofcorporation";
import { requestofuser as _requestofuser } from "./requestofuser";
import type { requestofuserAttributes, requestofuserCreationAttributes } from "./requestofuser";
import { studentwithcurrentschool as _studentwithcurrentschool } from "./studentwithcurrentschool";
import type {
    studentwithcurrentschoolAttributes,
    studentwithcurrentschoolCreationAttributes,
} from "./studentwithcurrentschool";
import { userofcorporation as _userofcorporation } from "./userofcorporation";
import type { userofcorporationAttributes, userofcorporationCreationAttributes } from "./userofcorporation";

export {
    _AcademicHistory as AcademicHistory,
    _Account as Account,
    _Consumer as Consumer,
    _Corporation as Corporation,
    _CorporationReview as CorporationReview,
    _ExamHistory as ExamHistory,
    _LanguageExam as LanguageExam,
    _Organization as Organization,
    _Request as Request,
    _School as School,
    _Student as Student,
    _StudentReview as StudentReview,
    _User as User,
    _VerificationToken as VerificationToken,
    _academichistorywithschool as academichistorywithschool,
    _examhistorywithlanguageexam as examhistorywithlanguageexam,
    _fullreviewinfoofcorp as fullreviewinfoofcorp,
    _fullstudentprofile as fullstudentprofile,
    _requestofcorporation as requestofcorporation,
    _requestofuser as requestofuser,
    _studentwithcurrentschool as studentwithcurrentschool,
    _userofcorporation as userofcorporation,
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
    academichistorywithschoolAttributes,
    academichistorywithschoolCreationAttributes,
    examhistorywithlanguageexamAttributes,
    examhistorywithlanguageexamCreationAttributes,
    fullreviewinfoofcorpAttributes,
    fullreviewinfoofcorpCreationAttributes,
    fullstudentprofileAttributes,
    fullstudentprofileCreationAttributes,
    requestofcorporationAttributes,
    requestofcorporationCreationAttributes,
    requestofuserAttributes,
    requestofuserCreationAttributes,
    studentwithcurrentschoolAttributes,
    studentwithcurrentschoolCreationAttributes,
    userofcorporationAttributes,
    userofcorporationCreationAttributes,
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
    const Request = _Request.initModel(sequelize);
    const School = _School.initModel(sequelize);
    const Student = _Student.initModel(sequelize);
    const StudentReview = _StudentReview.initModel(sequelize);
    const User = _User.initModel(sequelize);
    const VerificationToken = _VerificationToken.initModel(sequelize);
    const academichistorywithschool = _academichistorywithschool.initModel(sequelize);
    const examhistorywithlanguageexam = _examhistorywithlanguageexam.initModel(sequelize);
    const fullreviewinfoofcorp = _fullreviewinfoofcorp.initModel(sequelize);
    const fullstudentprofile = _fullstudentprofile.initModel(sequelize);
    const requestofcorporation = _requestofcorporation.initModel(sequelize);
    const requestofuser = _requestofuser.initModel(sequelize);
    const studentwithcurrentschool = _studentwithcurrentschool.initModel(sequelize);
    const userofcorporation = _userofcorporation.initModel(sequelize);

    Request.belongsTo(Consumer, { as: "consumer", foreignKey: "consumer_id" });
    Consumer.hasMany(Request, { as: "Requests", foreignKey: "consumer_id" });
    Consumer.belongsTo(Corporation, { as: "corp", foreignKey: "corp_id" });
    Corporation.hasMany(Consumer, { as: "Consumers", foreignKey: "corp_id" });
    ExamHistory.belongsTo(LanguageExam, { as: "exam", foreignKey: "exam_id" });
    LanguageExam.hasMany(ExamHistory, { as: "ExamHistories", foreignKey: "exam_id" });
    Consumer.belongsTo(Organization, { as: "orgn", foreignKey: "orgn_id" });
    Organization.hasMany(Consumer, { as: "Consumers", foreignKey: "orgn_id" });
    AcademicHistory.belongsTo(School, { as: "school", foreignKey: "school_id" });
    School.hasMany(AcademicHistory, { as: "AcademicHistories", foreignKey: "school_id" });
    AcademicHistory.belongsTo(Student, { as: "student", foreignKey: "student_id" });
    Student.hasMany(AcademicHistory, { as: "AcademicHistories", foreignKey: "student_id" });
    ExamHistory.belongsTo(Student, { as: "student", foreignKey: "student_id" });
    Student.hasMany(ExamHistory, { as: "ExamHistories", foreignKey: "student_id" });
    Account.belongsTo(User, { as: "user", foreignKey: "user_id" });
    User.hasMany(Account, { as: "Accounts", foreignKey: "user_id" });
    Consumer.belongsTo(User, { as: "user", foreignKey: "user_id" });
    User.hasMany(Consumer, { as: "Consumers", foreignKey: "user_id" });
    Student.belongsTo(User, { as: "user", foreignKey: "user_id" });
    User.hasMany(Student, { as: "Students", foreignKey: "user_id" });

    return {
        AcademicHistory: AcademicHistory,
        Account: Account,
        Consumer: Consumer,
        Corporation: Corporation,
        CorporationReview: CorporationReview,
        ExamHistory: ExamHistory,
        LanguageExam: LanguageExam,
        Organization: Organization,
        Request: Request,
        School: School,
        Student: Student,
        StudentReview: StudentReview,
        User: User,
        VerificationToken: VerificationToken,
        academichistorywithschool: academichistorywithschool,
        examhistorywithlanguageexam: examhistorywithlanguageexam,
        fullreviewinfoofcorp: fullreviewinfoofcorp,
        fullstudentprofile: fullstudentprofile,
        requestofcorporation: requestofcorporation,
        requestofuser: requestofuser,
        studentwithcurrentschool: studentwithcurrentschool,
        userofcorporation: userofcorporation,
    };
}
