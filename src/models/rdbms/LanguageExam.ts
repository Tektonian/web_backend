import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";
import type { ExamHistory, ExamHistoryId } from "./ExamHistory";
import { CountryCodeEnum } from "@mesh/api_spec/enum";
import { ExamEnum } from "@mesh/api_spec/enum";

interface EXAM_RESULT_TYPE {
    class: string;
    level: ExamEnum.EXAM_LEVEL_ENUM;
}
export interface LanguageExamAttributes {
    exam_id: Buffer;
    exam_name_glb: { [country_code in CountryCodeEnum.COUNTRY_CODE_ENUM]?: string };
    exam_results: EXAM_RESULT_TYPE[];
    exam_type?: ExamEnum.EXAM_TYPE;
    lang_country_code: CountryCodeEnum.COUNTRY_CODE_ENUM;
}

export type LanguageExamPk = "exam_id";
export type LanguageExamId = LanguageExam[LanguageExamPk];
export type LanguageExamOptionalAttributes = "exam_type";
export type LanguageExamCreationAttributes = Optional<LanguageExamAttributes, LanguageExamOptionalAttributes>;

export class LanguageExam
    extends Model<LanguageExamAttributes, LanguageExamCreationAttributes>
    implements LanguageExamAttributes
{
    exam_id!: Buffer;
    exam_name_glb!: { [country_code in CountryCodeEnum.COUNTRY_CODE_ENUM]?: string };
    exam_results!: EXAM_RESULT_TYPE[];
    exam_type?: ExamEnum.EXAM_TYPE;
    lang_country_code!: CountryCodeEnum.COUNTRY_CODE_ENUM;

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
                    type: DataTypes.BLOB,
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
                exam_type: {
                    type: DataTypes.STRING(45),
                    allowNull: true,
                    validate: {
                        isIn: [Object.values(ExamEnum.EXAM_TYPE)],
                    },
                },
                lang_country_code: {
                    type: DataTypes.STRING(4),
                    allowNull: false,
                    validate: {
                        isIn: [Object.values(CountryCodeEnum.COUNTRY_CODE_ENUM)],
                    },
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
