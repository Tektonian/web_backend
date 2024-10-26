import { DataTypes, Model } from "sequelize";
import studentProfileSequelize from "../dbconfig/studentProfileDatabase";

interface AcademicHis {
    degree: string;
    schoolName: string;
    schoolNationality: string;
    startDate: string;
    endDate: string;
    status: string;
    faculty: string;
}

class StudentProfile extends Model {
    public id!: number;
    public name!: string;
    public age!: number;
    public nationality!: string;
    public email!: string;
    public isEmailCertified!: string;
    public phoneNumber!: string;
    public emergencyContact!: string;
    public gender!: string;
    public langaugeList!: string[];
    public profilePhoto!: string;
    public hasCar!: boolean;
    public approximateCord!: string;
    public keywordList!: string[];
    public achievementPics!: string[];
    public academicHisList!: AcademicHis[];
}

StudentProfile.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        age: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        nationality: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        emailList: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        certifiedEmail: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        emergencyContact: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        gender: {
            type: DataTypes.ENUM("male", "female", "other"),
            allowNull: false,
        },
        langaugeList: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        profilePhoto: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        hasCar: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        approximateCord: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        keywordList: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        achievementPics: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        academicHisList: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    },
    {
        sequelize: studentProfileSequelize,
        tableName: "student_profiles",
    },
);

export default StudentProfile;
