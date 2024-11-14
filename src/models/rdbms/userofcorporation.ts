import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface userofcorporationAttributes {
  user_id: any;
  username?: string;
  email: string;
  image?: string;
  roles?: object;
  corp_id: number;
  corp_name: string;
  nationality: string;
  corp_domain?: string;
  ceo_name?: string;
  corp_address?: string;
  phone_number?: string;
  corp_num: number;
  biz_num?: number;
  biz_started_at?: string;
  status?: string;
  biz_type?: string;
  logo_image?: string;
  site_url?: string;
}

export type userofcorporationOptionalAttributes = "user_id" | "username" | "image" | "roles" | "corp_id" | "corp_domain" | "ceo_name" | "corp_address" | "phone_number" | "biz_num" | "biz_started_at" | "status" | "biz_type" | "logo_image" | "site_url";
export type userofcorporationCreationAttributes = Optional<userofcorporationAttributes, userofcorporationOptionalAttributes>;

export class userofcorporation extends Model<userofcorporationAttributes, userofcorporationCreationAttributes> implements userofcorporationAttributes {
  user_id!: any;
  username?: string;
  email!: string;
  image?: string;
  roles?: object;
  corp_id!: number;
  corp_name!: string;
  nationality!: string;
  corp_domain?: string;
  ceo_name?: string;
  corp_address?: string;
  phone_number?: string;
  corp_num!: number;
  biz_num?: number;
  biz_started_at?: string;
  status?: string;
  biz_type?: string;
  logo_image?: string;
  site_url?: string;


  static initModel(sequelize: Sequelize.Sequelize): typeof userofcorporation {
    return userofcorporation.init({
    user_id: {
      type: DataTypes.BLOB,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('uuid_to_bin(uuid())')
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
    },
    corp_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    corp_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    nationality: {
      type: DataTypes.STRING(4),
      allowNull: false
    },
    corp_domain: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ceo_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    corp_address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    phone_number: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    corp_num: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    biz_num: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    biz_started_at: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    biz_type: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    logo_image: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    site_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'userofcorporation',
    timestamps: false
  });
  }
}
