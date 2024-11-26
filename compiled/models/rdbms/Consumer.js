import { DataTypes, Model } from 'sequelize';
export class Consumer extends Model {
    consumer_id;
    user_id;
    corp_id;
    orgn_id;
    consumer_type;
    consumer_email;
    consumer_verified;
    phone_number;
    created_at;
    updated_at;
    // Consumer hasMany Request via consumer_id
    Requests;
    getRequests;
    setRequests;
    addRequest;
    addRequests;
    createRequest;
    removeRequest;
    removeRequests;
    hasRequest;
    hasRequests;
    countRequests;
    // Consumer belongsTo Corporation via corp_id
    corp;
    getCorp;
    setCorp;
    createCorp;
    // Consumer belongsTo Organization via orgn_id
    orgn;
    getOrgn;
    setOrgn;
    createOrgn;
    // Consumer belongsTo User via user_id
    user;
    getUser;
    setUser;
    createUser;
    static initModel(sequelize) {
        return Consumer.init({
            consumer_id: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            user_id: {
                type: DataTypes.BLOB,
                allowNull: true,
                references: {
                    model: 'User',
                    key: 'user_id'
                }
            },
            corp_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'Corporation',
                    key: 'corp_id'
                }
            },
            orgn_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'Organization',
                    key: 'orgn_id'
                }
            },
            consumer_type: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            consumer_email: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            consumer_verified: {
                type: DataTypes.DATE,
                allowNull: true,
                comment: "Consumer can have three types \n\nnormal: normal user\ncorp: user works at corporation \/ so corporation entity can have multiple providers\norgn: user works at organization \/  ``"
            },
            phone_number: {
                type: DataTypes.STRING(32),
                allowNull: false
            }
        }, {
            sequelize,
            tableName: 'Consumer',
            timestamps: true,
            indexes: [
                {
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "consumer_id" },
                    ]
                },
                {
                    name: "user_id_idx",
                    using: "BTREE",
                    fields: [
                        { name: "user_id" },
                    ]
                },
                {
                    name: "corp_id_idx",
                    using: "BTREE",
                    fields: [
                        { name: "corp_id" },
                    ]
                },
                {
                    name: "orgn_id_idx",
                    using: "BTREE",
                    fields: [
                        { name: "orgn_id" },
                    ]
                },
            ]
        });
    }
}
