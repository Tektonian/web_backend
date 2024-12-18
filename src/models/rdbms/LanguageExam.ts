import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";
import type { ExamHistory, ExamHistoryId } from "./ExamHistory";

export interface LanguageExamAttributes {
    exam_id: number;
    exam_name_glb: object;
    exam_results: object;
    lang_country_code: string;
}

export type LanguageExamPk = "exam_id";
export type LanguageExamId = LanguageExam[LanguageExamPk];
export type LanguageExamCreationAttributes = LanguageExamAttributes;

export class LanguageExam
    extends Model<LanguageExamAttributes, LanguageExamCreationAttributes>
    implements LanguageExamAttributes
{
    exam_id!: number;
    exam_name_glb!: object;
    exam_results!: object;
    lang_country_code!: string;

    // LanguageExam hasMany ExamHistory via exam_id
    ExamHistories!: ExamHistory[];
    getExamHistories!: Sequelize.HasManyGetAssociationsMixin<ExamHistory>;
    setExamHistories!: Sequelize.HasManySetAssociationsMixin<ExamHistory, ExamHistoryId>;
    addExamHistory!: Sequelize.HasManyAddAssociationMixin<ExamHistory, ExamHistoryId>;
    addExamHistories!: Sequelize.HasManyAddAssociationsMixin<ExamHistory, ExamHistoryId>;
    createExamHistory!: Sequelize.HasManyCreateAssociationMixin<ExamHistory>;
    removeExamHistory!: Sequelize.HasManyRemoveAssociationMixin<ExamHistory, ExamHistoryId>;
    removeExamHistories!: Sequelize.HasManyRemoveAssociationsMixin<ExamHistory, ExamHistoryId>;
    hasExamHistory!: Sequelize.HasManyHasAssociationMixin<ExamHistory, ExamHistoryId>;
    hasExamHistories!: Sequelize.HasManyHasAssociationsMixin<ExamHistory, ExamHistoryId>;
    countExamHistories!: Sequelize.HasManyCountAssociationsMixin;

    static initModel(sequelize: Sequelize.Sequelize): typeof LanguageExam {
        return LanguageExam.init(
            {
                exam_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
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
                tableName: "LanguageExam",
                timestamps: false,
                indexes: [
                    {
                        name: "PRIMARY",
                        unique: true,
                        using: "BTREE",
                        fields: [{ name: "exam_id" }],
                    },
                ],
            },
        );
    }
}
