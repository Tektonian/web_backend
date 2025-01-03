import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";

type AcademicType = {
    school_id: number;
    degree: string;
    start_date: string;
    end_date: string;
    status: 0 | 1 | 2;
    faculty: string;
    school_name: string;
    school_name_glb: string;
    country_code: string;
    address: string;
    coordinate: string;
    hompage_url: string;
    phone_number: string;
};
type LanguageType = {
    exam_id: number;
    exam_result: string;
    exam_name_glb: string;
    exam_results: object;
    lang_country_code: string;
};
export interface fullstudentprofileAttributes {
    student_id: number;
    user_id: any;
    name_glb: object;
    birth_date: string;
    created_at?: Date;
    email_verified?: Date;
    phone_number: string;
    emergency_contact: string;
    gender: number;
    image: string;
    has_car: number;
    keyword_list: object;
    academic?: AcademicType[];
    language?: LanguageType[];
}

export type fullstudentprofileOptionalAttributes =
    | "student_id"
    | "created_at"
    | "email_verified"
    | "image"
    | "has_car"
    | "academic"
    | "language";
export type fullstudentprofileCreationAttributes = Optional<
    fullstudentprofileAttributes,
    fullstudentprofileOptionalAttributes
>;

export class fullstudentprofile
    extends Model<fullstudentprofileAttributes, fullstudentprofileCreationAttributes>
    implements fullstudentprofileAttributes
{
    student_id!: number;
    user_id!: any;
    name_glb!: object;
    birth_date!: string;
    created_at?: Date;
    email_verified?: Date;
    phone_number!: string;
    emergency_contact!: string;
    gender!: number;
    image!: string;
    has_car!: number;
    keyword_list!: object;
    academic?: AcademicType[];
    language?: LanguageType[];

    static initModel(sequelize: Sequelize.Sequelize): typeof fullstudentprofile {
        return fullstudentprofile.init(
            {
                student_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                },
                user_id: {
                    type: DataTypes.BLOB,
                    allowNull: false,
                },
                name_glb: {
                    type: DataTypes.JSON,
                    allowNull: false,
                },
                birth_date: {
                    type: DataTypes.DATEONLY,
                    allowNull: false,
                },
                email_verified: {
                    type: DataTypes.DATE,
                    allowNull: true,
                    comment:
                        "email_verified field could be set if one of the `AcademicHistory` entity of students has been verified",
                },
                phone_number: {
                    type: DataTypes.STRING(32),
                    allowNull: false,
                },
                emergency_contact: {
                    type: DataTypes.STRING(32),
                    allowNull: false,
                },
                gender: {
                    type: DataTypes.TINYINT,
                    allowNull: false,
                },
                image: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                    defaultValue: "",
                },
                has_car: {
                    type: DataTypes.TINYINT,
                    allowNull: false,
                    defaultValue: 0,
                },
                keyword_list: {
                    type: DataTypes.JSON,
                    allowNull: false,
                },
                academic: {
                    type: DataTypes.JSON,
                    allowNull: true,
                },
                language: {
                    type: DataTypes.JSON,
                    allowNull: true,
                },
            },
            {
                sequelize,
                tableName: "fullstudentprofile",
                timestamps: false,
            },
        );
    }
}
