/**
 * 管理 MagicURL 的类
 * */
class MagicURL{
    static async setMagicUrl(url) {
        return await chrome.storage.local.set({
            GoGoUrl: url
        });
    }
    static async getMagicUrl() {
        return (await chrome.storage.local.get('GoGoUrl')).GoGoUrl;
    }

    // ture:开启使用魔法聊天|false:关闭使用魔法聊天
    static async setChatHubWithMagic(user) {
        return await chrome.storage.local.set({
            ChatHubWithMagic: user
        });
    }

    // ture|false
    static async getChatHubWithMagic() {
        return !!(await chrome.storage.local.get('ChatHubWithMagic')).ChatHubWithMagic;
    }
}
export default MagicURL;