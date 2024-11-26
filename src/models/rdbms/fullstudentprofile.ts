import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";

export interface fullstudentprofileAttributes {
    student_id: number;
    user_id: any;
    name_glb: object;
    nationality: string;
    age: string;
    created_at?: Date;
    email_verified?: Date;
    phone_number: string;
    emergency_contact: string;
    gender: string;
    image?: string;
    has_car?: any;
    keyword_list?: object;
    academic?: object;
    language?: object;
}

export type fullstudentprofileOptionalAttributes =
    | "student_id"
    | "created_at"
    | "email_verified"
    | "image"
    | "has_car"
    | "keyword_list"
    | "academic"
    | "language";
export type fullstudentprofileCreationAttributes = Optional<
    fullstudentprofileAttributes,
    fullstudentprofileOptionalAttributes
>;

export class fullstudentprofile
    extends Model<
        fullstudentprofileAttributes,
        fullstudentprofileCreationAttributes
    >
    implements fullstudentprofileAttributes
{
    student_id!: number;
    user_id!: any;
    name_glb!: object;
    nationality!: string;
    age!: string;
    created_at?: Date;
    email_verified?: Date;
    phone_number!: string;
    emergency_contact!: string;
    gender!: string;
    image?: string;
    has_car?: any;
    keyword_list?: object;
    academic?: object;
    language?: object;

    static initModel(
        sequelize: Sequelize.Sequelize,
    ): typeof fullstudentprofile {
        return fullstudentprofile.init(
            {
                student_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
<<<<<<< HEAD
                    defaultValue: 0,
                    primaryKey: true,
=======
                    primaryKey: true,
                    defaultValue: 0,
>>>>>>> 4d60a37db45cf3b757fc200f7b889469306e65b3
                },
                user_id: {
                    type: DataTypes.BLOB,
                    allowNull: false,
                },
                name_glb: {
                    type: DataTypes.JSON,
                    allowNull: false,
                },
                nationality: {
                    type: DataTypes.STRING(4),
                    allowNull: false,
                },
                age: {
                    type: DataTypes.STRING(4),
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
                    type: DataTypes.STRING(8),
                    allowNull: false,
                },
                image: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                has_car: {
                    type: DataTypes.BLOB,
                    allowNull: true,
                },
                keyword_list: {
                    type: DataTypes.JSON,
                    allowNull: true,
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
