import { DataTypes, Model } from 'sequelize';
export class LanguageExam extends Model {
    exam_id;
    exam_name_glb;
    exam_result_type;
    exam_results;
    exam_level;
    lang_country_code;
    // LanguageExam hasMany ExamHistory via exam_id
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
    static initModel(sequelize) {
        return LanguageExam.init({
            exam_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
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
            tableName: 'LanguageExam',
            timestamps: false,
            indexes: [
                {
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "exam_id" },
                    ]
                },
            ]
        });
    }
}
