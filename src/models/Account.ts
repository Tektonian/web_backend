import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { User, UserId } from './User';

export interface AccountAttributes {
  user_id: any;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}

export type AccountPk = "provider" | "providerAccountId";
export type AccountId = Account[AccountPk];
export type AccountOptionalAttributes = "refresh_token" | "access_token" | "expires_at" | "token_type" | "scope" | "id_token" | "session_state";
export type AccountCreationAttributes = Optional<AccountAttributes, AccountOptionalAttributes>;

export class Account extends Model<AccountAttributes, AccountCreationAttributes> implements AccountAttributes {
  user_id!: any;
  type!: string;
  provider!: string;
  providerAccountId!: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;

  // Account belongsTo User via user_id
  user!: User;
  getUser!: Sequelize.BelongsToGetAssociationMixin<User>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<User, UserId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<User>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Account {
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
