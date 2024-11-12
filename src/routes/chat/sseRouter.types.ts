export interface resUnreadProps {
    unreadCount: Number;
    lastSentMessageType: "text" | "image" | "map";
    lastSentMessageContent: String;
    lastSentMessageTime: Date;
    lastMessageSender: String;
}

export interface resAllUnread {
    unreads: resUnreadProps[];
}


export interface sseUnreadProps extends resUnreadProps;