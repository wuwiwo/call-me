export const CONFIG = {
    webhookUrl:
        "https://trigger.macrodroid.com/16c8a69d-d6b2-40f4-9b93-5d76880f3527/webhook",
        const basePath = location.pathname.includes('github.io'
? '/call-me/' 
  : '/';
    cooldownTime: 60, // 冷却时间(秒)
    maxHistoryRecords: 100, // 最大历史记录数
    defaultAvatar: "👤", // 默认头像
    defaultName: {
        // 默认昵称
        zh: "玩家",
        en: "Player"
    },
    emojiOptions: ["🐶", "🐱", "🦊", "🐯", "🦁", "🐨", "🐵", "🐧", "🦄", "🐟"], // 可选emoji头像
    notificationDuration: 3000, // 通知显示时间(毫秒)
    //音效
    soundEffects: {
        avatars: {
            "🐶": "sounds/dog-bark.mp3",
            
            "🐱": "sounds/cat-meow.mp3",
            "🦊": "sounds/fox-sound.mp3",
            "🐯": "sounds/tiger-roar.wav",
            default: "sounds/default-click.m4a"
        },
        // 操作反馈音效
        notifications: {
            success: "sounds/success-notification.wav",
            error: "sounds/error-alert.mp3"
        }
    }
};
