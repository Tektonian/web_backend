import { DataTypes, Model } from 'sequelize';
export class fullstudentprofile extends Model {
    student_id;
    user_id;
    name_glb;
    nationality;
    age;
    created_at;
    email_verified;
    phone_number;
    emergency_contact;
    gender;
    image;
    has_car;
    keyword_list;
    academic;
    language;
    static initModel(sequelize) {
        return fullstudentprofile.init({
            student_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            user_id: {
                type: DataTypes.BLOB,
                allowNull: false
            },
            name_glb: {
                type: DataTypes.JSON,
                allowNull: false
            },
            nationality: {
                type: DataTypes.STRING(4),
                allowNull: false
            },
            age: {
                type: DataTypes.STRING(4),
                allowNull: false
            },
            email_verified: {
                type: DataTypes.DATE,
                allowNull: true,
                comment: "email_verified field could be set if one of the `AcademicHistory` entity of students has been verified"
            },
            phone_number: {
                type: DataTypes.STRING(32),
                allowNull: false
            },
            emergency_contact: {
                type: DataTypes.STRING(32),
                allowNull: false
            },
            gender: {
                type: DataTypes.STRING(8),
                allowNull: false
            },
            image: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            has_car: {
                type: DataTypes.BLOB,
                allowNull: true
            },
            keyword_list: {
                type: DataTypes.JSON,
                allowNull: true
            },
            academic: {
                type: DataTypes.JSON,
                allowNull: true
            },
            language: {
                type: DataTypes.JSON,
                allowNull: true
            }
        }, {
            sequelize,
            tableName: 'fullstudentprofile',
            timestamps: true
        });
    }
}
