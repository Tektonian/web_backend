import { ObjectId, Types } from "mongoose";

export interface IChatContent {
    chatroom: Types.ObjectId;
    seq: number;
    content_type: "text" | "image" | "file" | "map";
    content: string;
    sender_id: Types.UUID;
    image_url: string;
}

export interface IChatroom {
    request_id: number;
    consumer_id: Types.UUID;
    participant_ids: [Types.UUID];
    message_seq: number;
}

export interface IChatUser {
    user_id: Types.UUID;
    username: string;
    nationality: string;
    multilingual: [string];
    user_name_glb: Map<string, string>;
    email: String;
    image_url: String;
}
export interface IUnread {
    chatroom: Types.ObjectId;
    user_id: Types.UUID;
    send_alarm: boolean;
    last_read_at: Date;
    last_read_seq: number;
}
