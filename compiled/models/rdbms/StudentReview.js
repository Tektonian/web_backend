import { DataTypes, Model } from 'sequelize';
export class StudentReview extends Model {
    id;
    corp_id;
    orgn_id;
    consumer_id;
    student_id;
    request_id;
    request_url;
    was_late;
    was_proactive;
    was_diligent;
    commu_ability;
    lang_fluent;
    goal_fulfillment;
    want_cowork;
    praise;
    need_improve;
    created_at;
    updated_at;
    static initModel(sequelize) {
        return StudentReview.init({
            id: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            corp_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                comment: "Have no idea that this field could be utilized late;;"
            },
            orgn_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                comment: "Have no idea that this field could be utilized late;;"
            },
            consumer_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            student_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            request_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            request_url: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            was_late: {
                type: DataTypes.TINYINT,
                allowNull: false
            },
            was_proactive: {
                type: DataTypes.TINYINT,
                allowNull: false
            },
            was_diligent: {
                type: DataTypes.TINYINT,
                allowNull: false
            },
            commu_ability: {
                type: DataTypes.TINYINT,
                allowNull: false
            },
            lang_fluent: {
                type: DataTypes.TINYINT,
                allowNull: false
            },
            goal_fulfillment: {
                type: DataTypes.TINYINT,
                allowNull: false
            },
            want_cowork: {
                type: DataTypes.TINYINT,
                allowNull: false
            },
            praise: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            need_improve: {
                type: DataTypes.TEXT,
                allowNull: true
            }
        }, {
            sequelize,
            tableName: 'StudentReview',
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
