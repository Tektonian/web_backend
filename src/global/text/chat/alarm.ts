export const AlarmMessageGlb = {
    created: {
        kr: {
            content: "채팅방이 생성되었습니다",
        },
        en: {
            content: "Chat room creeated",
        },
        jp: {
            content: "チャット生成",
        },
    },
    contracted: {
        kr: {
            content: "요청이 수락되었어요",
        },
        en: {
            content: "Request Gotcha",
        },
        jp: {
            content: "リクエストガッチャ",
        },
    },
    checkArrived: {
        kr: {
            content: "도착확인을 눌러주세요",
        },
        en: {
            content: "Please check arrived",
        },
        jp: {
            content: "出席確認",
        },
    },
} as const;

export type AlarmMessageGlbEnum = keyof typeof AlarmMessageGlb;
