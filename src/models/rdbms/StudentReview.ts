import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";

export interface StudentReviewAttributes {
    id: number;
    corp_id?: number;
    orgn_id?: number;
    consumer_id: number;
    student_id: number;
    request_id: number;
    request_url: string;
    was_late: number;
    was_proactive: number;
    was_diligent: number;
    commu_ability: number;
    lang_fluent: number;
    goal_fulfillment: number;
    want_cowork: number;
    praise?: string;
    need_improve?: string;
    created_at?: Date;
    updated_at?: Date;
}

export type StudentReviewPk = "id";
export type StudentReviewId = StudentReview[StudentReviewPk];
export type StudentReviewOptionalAttributes =
    | "id"
    | "corp_id"
    | "orgn_id"
    | "praise"
    | "need_improve"
    | "created_at"
    | "updated_at";
export type StudentReviewCreationAttributes = Optional<
    StudentReviewAttributes,
    StudentReviewOptionalAttributes
>;

export class StudentReview
    extends Model<StudentReviewAttributes, StudentReviewCreationAttributes>
    implements StudentReviewAttributes
{
    id!: number;
    corp_id?: number;
    orgn_id?: number;
    consumer_id!: number;
    student_id!: number;
    request_id!: number;
    request_url!: string;
    was_late!: number;
    was_proactive!: number;
    was_diligent!: number;
    commu_ability!: number;
    lang_fluent!: number;
    goal_fulfillment!: number;
    want_cowork!: number;
    praise?: string;
    need_improve?: string;
    created_at?: Date;
    updated_at?: Date;

    static initModel(sequelize: Sequelize.Sequelize): typeof StudentReview {
        return StudentReview.init(
            {
                id: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                },
                corp_id: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    comment:
                        "Have no idea that this field could be utilized late;;",
                },
                orgn_id: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    comment:
                        "Have no idea that this field could be utilized late;;",
                },
                consumer_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                student_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                request_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                request_url: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                was_late: {
                    type: DataTypes.TINYINT,
                    allowNull: false,
                },
                was_proactive: {
                    type: DataTypes.TINYINT,
                    allowNull: false,
                },
                was_diligent: {
                    type: DataTypes.TINYINT,
                    allowNull: false,
                },
                commu_ability: {
                    type: DataTypes.TINYINT,
                    allowNull: false,
                },
                lang_fluent: {
                    type: DataTypes.TINYINT,
                    allowNull: false,
                },
                goal_fulfillment: {
                    type: DataTypes.TINYINT,
                    allowNull: false,
                },
                want_cowork: {
                    type: DataTypes.TINYINT,
                    allowNull: false,
                },
                praise: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                need_improve: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
            },
            {
                sequelize,
                tableName: "StudentReview",
                timestamps: false,
                indexes: [
                    {
                        name: "PRIMARY",
                        unique: true,
                        using: "BTREE",
                        fields: [{ name: "id" }],
                    },
                ],
            },
        );
    }
}
