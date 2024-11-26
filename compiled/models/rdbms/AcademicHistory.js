import { DataTypes, Model } from 'sequelize';
export class AcademicHistory extends Model {
    id;
    school_id;
    student_id;
    degree;
    start_date;
    end_date;
    status;
    faculty;
    school_email;
    is_attending;
    // AcademicHistory belongsTo School via school_id
    school;
    getSchool;
    setSchool;
    createSchool;
    // AcademicHistory belongsTo Student via student_id
    student;
    getStudent;
    setStudent;
    createStudent;
    static initModel(sequelize) {
        return AcademicHistory.init({
            id: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            school_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'School',
                    key: 'school_id'
                }
            },
            student_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Student',
                    key: 'student_id'
                }
            },
            degree: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            start_date: {
                type: DataTypes.DATEONLY,
                allowNull: false
            },
            end_date: {
                type: DataTypes.DATEONLY,
                allowNull: false
            },
            status: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            faculty: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            school_email: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            is_attending: {
                type: DataTypes.TINYINT,
                allowNull: true,
                defaultValue: 0,
                comment: "Whether a student is attending a school now or not.\n\nIf a Student is connected to multiple AcademicHistory, only one is_attending should be set true.\n\nUser can have multiple AcademicHistory, but s\/he must be attending only one school.\n\n"
            }
        }, {
            sequelize,
            tableName: 'AcademicHistory',
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
                    name: "school_id_idx",
                    using: "BTREE",
                    fields: [
                        { name: "school_id" },
                    ]
                },
                {
                    name: "student_id_idx",
                    using: "BTREE",
                    fields: [
                        { name: "student_id" },
                    ]
                },
            ]
        });
    }
}
