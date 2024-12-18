import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";

export interface examhistorywithlanguageexamAttributes {
    student_id: number;
    exam_result?: string;
    exam_id: number;
    exam_name_glb: object;
    exam_results: object;
    lang_country_code: string;
}

export type examhistorywithlanguageexamOptionalAttributes = "exam_result";
export type examhistorywithlanguageexamCreationAttributes = Optional<
    examhistorywithlanguageexamAttributes,
    examhistorywithlanguageexamOptionalAttributes
>;

export class examhistorywithlanguageexam
    extends Model<examhistorywithlanguageexamAttributes, examhistorywithlanguageexamCreationAttributes>
    implements examhistorywithlanguageexamAttributes
{
    student_id!: number;
    exam_result?: string;
    exam_id!: number;
    exam_name_glb!: object;
    exam_results!: object;
    lang_country_code!: string;

    static initModel(sequelize: Sequelize.Sequelize): typeof examhistorywithlanguageexam {
        return examhistorywithlanguageexam.init(
            {
                student_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                exam_result: {
                    type: DataTypes.STRING(45),
                    allowNull: true,
                },
                exam_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                exam_name_glb: {
                    type: DataTypes.JSON,
                    allowNull: false,
                },
                exam_results: {
                    type: DataTypes.JSON,
                    allowNull: false,
                    comment: "If a test is class type then the classes of a result of the test should be listed",
                },
                lang_country_code: {
                    type: DataTypes.STRING(2),
                    allowNull: false,
                },
            },
            {
                sequelize,
                tableName: "examhistorywithlanguageexam",
                timestamps: false,
            },
        );
    }
}
