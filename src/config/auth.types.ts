import { DataTypes } from "sequelize";

type StringfiedUUID = {
    type: "Buffer";
    data: [number];
};

export interface ISessionUser {
    id: typeof DataTypes.UUID | StringfiedUUID;
    name: string;
    email: string;
    roles: string[];
}
