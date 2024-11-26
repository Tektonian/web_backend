import { DataTypes, Model } from 'sequelize';
export class Account extends Model {
    user_id;
    type;
    provider;
    providerAccountId;
    refresh_token;
    access_token;
    expires_at;
    token_type;
    scope;
    id_token;
    session_state;
    password;
    salt;
    // Account belongsTo User via user_id
    user;
    getUser;
    setUser;
    createUser;
    static initModel(sequelize) {
        return Account.init({
            user_id: {
                type: DataTypes.BLOB,
                allowNull: false,
                references: {
                    model: 'User',
                    key: 'user_id'
                }
            },
            type: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            provider: {
                type: DataTypes.STRING(255),
                allowNull: false,
                primaryKey: true
            },
            providerAccountId: {
                type: DataTypes.STRING(255),
                allowNull: false,
                primaryKey: true
            },
            refresh_token: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            access_token: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            expires_at: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            token_type: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            scope: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            id_token: {
                type: DataTypes.STRING(2048),
                allowNull: true
            },
            session_state: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            password: {
                type: DataTypes.STRING(32),
                allowNull: true
            },
            salt: {
                type: DataTypes.STRING(7),
                allowNull: true
            }
        }, {
            sequelize,
            tableName: 'Account',
            timestamps: false,
            indexes: [
                {
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "provider" },
                        { name: "providerAccountId" },
                    ]
                },
                {
                    name: "user_id_idx",
                    using: "BTREE",
                    fields: [
                        { name: "user_id" },
                    ]
                },
            ]
        });
    }
}
