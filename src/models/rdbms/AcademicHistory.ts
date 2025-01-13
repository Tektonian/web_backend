import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";
import type { School, SchoolId } from "./School";
import type { Student, StudentId } from "./Student";

export interface AcademicHistoryAttributes {
    id: number;
    school_id: number;
    student_id: number;
    degree: string;
    start_date: string;
    end_date: string;
    status: number;
    faculty: string;
    school_email?: string;
    is_attending?: number;
}

export type AcademicHistoryPk = "id";
export type AcademicHistoryId = AcademicHistory[AcademicHistoryPk];
export type AcademicHistoryOptionalAttributes = "id" | "school_email" | "is_attending";
export type AcademicHistoryCreationAttributes = Optional<AcademicHistoryAttributes, AcademicHistoryOptionalAttributes>;

export class AcademicHistory
    extends Model<AcademicHistoryAttributes, AcademicHistoryCreationAttributes>
    implements AcademicHistoryAttributes
{
    id!: number;
    school_id!: number;
    student_id!: number;
    degree!: string;
    start_date!: string;
    end_date!: string;
    status!: number;
    faculty!: string;
    school_email?: string;
    is_attending?: number;

    // AcademicHistory belongsTo School via school_id
    school!: School;
    getSchool!: Sequelize.BelongsToGetAssociationMixin<School>;
    setSchool!: Sequelize.BelongsToSetAssociationMixin<School, SchoolId>;
    createSchool!: Sequelize.BelongsToCreateAssociationMixin<School>;
    // AcademicHistory belongsTo Student via student_id
    student!: Student;
    getStudent!: Sequelize.BelongsToGetAssociationMixin<Student>;
    setStudent!: Sequelize.BelongsToSetAssociationMixin<Student, StudentId>;
    createStudent!: Sequelize.BelongsToCreateAssociationMixin<Student>;

    static initModel(sequelize: Sequelize.Sequelize): typeof AcademicHistory {
        return AcademicHistory.init(
            {
                id: {
                    autoIncrement: true,
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                },
                school_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: "School",
                        key: "school_id",
                    },
                },
                student_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: "Student",
                        key: "student_id",
                    },
                },
                degree: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                start_date: {
                    type: DataTypes.DATEONLY,
                    allowNull: false,
                },
                end_date: {
                    type: DataTypes.DATEONLY,
                    allowNull: false,
                },
                status: {
                    type: DataTypes.TINYINT,
                    allowNull: false,
                },
                faculty: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                school_email: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                is_attending: {
                    type: DataTypes.TINYINT,
                    allowNull: true,
                    defaultValue: 0,
                    comment:
                        "Whether a student is attending a school now or not.\n\nIf a Student is connected to multiple AcademicHistory, only one is_attending should be set true.\n\nUser can have multiple AcademicHistory, but s\/he must be attending only one school.\n\n",
                },
            },
            {
                sequelize,
                tableName: "AcademicHistory",
                timestamps: false,
                indexes: [
                    {
                        name: "PRIMARY",
                        unique: true,
                        using: "BTREE",
                        fields: [{ name: "id" }],
                    },
                    {
                        name: "school_id_idx",
                        using: "BTREE",
                        fields: [{ name: "school_id" }],
                    },
                    {
                        name: "student_id_idx",
                        using: "BTREE",
                        fields: [{ name: "student_id" }],
                    },
                ],
            },
        );
    }
}
