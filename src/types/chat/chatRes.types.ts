export interface ResChatRoom {
    chatRoomId: string;
    consumerName: string;
    providerNames: string[];
    messageSeq: number;
    lastSender: string;
    lastMessage: string;
    lastSentTime: Date;
}
