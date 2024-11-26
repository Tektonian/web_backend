import { DataTypes, Model } from 'sequelize';
export class ExamHistory extends Model {
    id;
    student_id;
    exam_id;
    exam_result;
    // ExamHistory belongsTo LanguageExam via exam_id
    exam;
    getExam;
    setExam;
    createExam;
    // ExamHistory belongsTo Student via student_id
    student;
    getStudent;
    setStudent;
    createStudent;
    static initModel(sequelize) {
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
