import { DataTypes, Model } from 'sequelize';
export class Student extends Model {
    student_id;
    user_id;
    name_glb;
    nationality;
    age;
    email_verified;
    phone_number;
    emergency_contact;
    gender;
    image;
    has_car;
    keyword_list;
    created_at;
    updated_at;
    // Student hasMany AcademicHistory via student_id
    AcademicHistories;
    getAcademicHistories;
    setAcademicHistories;
    addAcademicHistory;
    addAcademicHistories;
    createAcademicHistory;
    removeAcademicHistory;
    removeAcademicHistories;
    hasAcademicHistory;
    hasAcademicHistories;
    countAcademicHistories;
    // Student hasMany ExamHistory via student_id
    ExamHistories;
    getExamHistories;
    setExamHistories;
    addExamHistory;
    addExamHistories;
    createExamHistory;
    removeExamHistory;
    removeExamHistories;
    hasExamHistory;
    hasExamHistories;
    countExamHistories;
    // Student belongsTo User via user_id
    user;
    getUser;
    setUser;
    createUser;
    static initModel(sequelize) {
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
