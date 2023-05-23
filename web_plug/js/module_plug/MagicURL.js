/**
 * 管理 MagicURL 的类
 * */
export default class MagicURL{
    static async setMagicUrl(url) {
        return await chrome.storage.local.set({
            GoGoUrl: url
        });
    }
    static async getMagicUrl() {
        return (await chrome.storage.local.get('GoGoUrl')).GoGoUrl;
    }
}