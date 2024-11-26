import { DataTypes, Model } from 'sequelize';
export class CorporationReview extends Model {
    id;
    consumer_id;
    student_id;
    corp_id;
    reqeust_id;
    request_url;
    review_text;
    prep_requirement;
    work_atmosphere;
    sense_of_achive;
    work_intensity;
    pay_satisfaction;
    CorporationReviewcol;
    created_at;
    updated_at;
    static initModel(sequelize) {
        return CorporationReview.init({
            id: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            consumer_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            student_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            corp_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            reqeust_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            request_url: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            review_text: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            prep_requirement: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            work_atmosphere: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            sense_of_achive: {
                type: DataTypes.TINYINT,
                allowNull: true
            },
            work_intensity: {
                type: DataTypes.TINYINT,
                allowNull: true
            },
            pay_satisfaction: {
                type: DataTypes.TINYINT,
                allowNull: true
            },
            CorporationReviewcol: {
                type: DataTypes.STRING(45),
                allowNull: true
            }
        }, {
            sequelize,
            tableName: 'CorporationReview',
            timestamps: true,
            indexes: [
                {
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "id" },
                    ]
                },
            ]
        });
    }
}
