import * as Sequelize from 'sequelize';
import { DataTypes, Model } from 'sequelize';
export class User extends Model {
    user_id;
    username;
    email;
    created_at;
    updated_at;
    image;
    roles;
    // User hasMany Account via user_id
    Accounts;
    getAccounts;
    setAccounts;
    addAccount;
    addAccounts;
    createAccount;
    removeAccount;
    removeAccounts;
    hasAccount;
    hasAccounts;
    countAccounts;
    // User hasMany Consumer via user_id
    Consumers;
    getConsumers;
    setConsumers;
    addConsumer;
    addConsumers;
    createConsumer;
    removeConsumer;
    removeConsumers;
    hasConsumer;
    hasConsumers;
    countConsumers;
    // User hasMany Student via user_id
    Students;
    getStudents;
    setStudents;
    addStudent;
    addStudents;
    createStudent;
    removeStudent;
    removeStudents;
    hasStudent;
    hasStudents;
    countStudents;
    static initModel(sequelize) {
        return User.init({
            user_id: {
                type: DataTypes.BLOB,
                allowNull: false,
                defaultValue: Sequelize.Sequelize.literal('uuid_to_bin(uuid())'),
                primaryKey: true
            },
            username: {
                type: DataTypes.STRING(64),
                allowNull: true
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            image: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            roles: {
                type: DataTypes.JSON,
                allowNull: true,
                comment: "To implement RBAC based access control, `roles` are needed.\n\nWe can filter unauthorized requests with role entity without querying database.\n\nOnce verification has been occurred user’s roles must be changed!!!!"
            }
        }, {
            sequelize,
            tableName: 'User',
            timestamps: true,
            indexes: [
                {
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "user_id" },
                    ]
                },
                {
                    name: "user_id_UNIQUE",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "user_id" },
                    ]
                },
            ]
        });
    }
}
