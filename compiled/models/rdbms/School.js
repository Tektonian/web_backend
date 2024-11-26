import { DataTypes, Model } from "sequelize";
export class School extends Model {
    school_id;
    school_name;
    school_name_glb;
    country_code;
    address;
    coordinate;
    hompage_url;
    email_domain;
    phone_number;
    // School hasMany AcademicHistory via school_id
    AcademicHistories;
    getAcademicHistories;
    setAcademicHistories;
    addAcademicHistory;
    addAcademicHistories;
    createAcademicHistory;
    removeAcademicHistory;
    removeAcademicHistories;
    hasAcademicHistory;
    hasAcademicHistories;
    countAcademicHistories;
    static initModel(sequelize) {
        return School.init({
            school_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
            },
            school_name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            school_name_glb: {
                type: DataTypes.JSON,
                allowNull: false,
            },
            country_code: {
                type: DataTypes.STRING(4),
                allowNull: false,
            },
            address: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            coordinate: {
                type: DataTypes.GEOMETRY("POINT"),
                allowNull: false,
                comment: "School can have multiple campus\n",
            },
            hompage_url: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            email_domain: {
                type: DataTypes.STRING(45),
                allowNull: true,
            },
            phone_number: {
                type: DataTypes.STRING(45),
                allowNull: true,
            },
        }, {
            sequelize,
            tableName: "School",
            timestamps: false,
            indexes: [
                {
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [{ name: "school_id" }],
                },
            ],
        });
    }
}
