import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";
import { VerificationTokenEnum } from "api_spec/enum";

export interface VerificationTokenAttributes {
    identifier: string;
    token: string;
    expires: Date;
    token_type: string;
}

export type VerificationTokenPk = "identifier" | "token";
export type VerificationTokenId = VerificationToken[VerificationTokenPk];
export type VerificationTokenOptionalAttributes = "expires";
export type VerificationTokenCreationAttributes = Optional<
    VerificationTokenAttributes,
    VerificationTokenOptionalAttributes
>;

export class VerificationToken
    extends Model<
        VerificationTokenAttributes,
        VerificationTokenCreationAttributes
    >
    implements VerificationTokenAttributes
{
    identifier!: string;
    token!: string;
    expires!: Date;
    token_type!: string;

    static initModel(sequelize: Sequelize.Sequelize): typeof VerificationToken {
        return VerificationToken.init(
            {
                identifier: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                    primaryKey: true,
                    comment:
                        "User’s email address\nDidn’t set to foreign key but it is 1:N relationship.\nDue to users forgetting or failures during the sign-in flow, you might end up with unwanted rows in your database. You might want to periodically clean these up to avoid filling up your database with unnecessary data.",
                },
                token: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                    primaryKey: true,
                },
                expires: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue:
                        Sequelize.Sequelize.literal("CURRENT_TIMESTAMP"),
                },
                token_type: {
                    type: DataTypes.STRING(45),
                    allowNull: false,
                    comment:
                        "Verification token can be used for various types of entities\n\nFor example: verification for corporation user, organization user, and student user \n\nSo there could be four types. \nnull: default type when user sign in\nstudent: when user verifies itself is student\norgz: ``\nCorp: ``",
                    validate: {
                        isIn: [
                            Object.values(
                                VerificationTokenEnum.VERIFICATION_TOKEN_ENUM,
                            ),
                        ],
                    },
                },
            },
            {
                sequelize,
                tableName: "VerificationToken",
                timestamps: false,
                indexes: [
                    {
                        name: "PRIMARY",
                        unique: true,
                        using: "BTREE",
                        fields: [{ name: "identifier" }, { name: "token" }],
                    },
                ],
            },
        );
    }
}
