import { DataTypes, Model } from 'sequelize';
export class examhistorywithlanguageexam extends Model {
    student_id;
    exam_result;
    exam_id;
    exam_name_glb;
    exam_result_type;
    exam_results;
    exam_level;
    lang_country_code;
    static initModel(sequelize) {
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
