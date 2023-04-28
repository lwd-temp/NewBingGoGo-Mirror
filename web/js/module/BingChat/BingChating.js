import SendMessageManager from "./SendMessageManager.js";
import nBGGFetch from "../nBGGFetch.js";
import ReturnMessage from "./ReturnMessage.js";

/**
 * 用于发送聊天消息和接受消息的对象
 * 使用 BingChat 创建
 */
export default class BingChating {
    /**
     * 对象
     */
    bingChat;
    sendMessageManager;

    //theChatType chatTypes变量中的其中一个
    //invocationId 可以不传
    //(string,ture|false|'repeat',string,string,string,theChatType,int|undefined)
    /**
     * @param bingChat BingChat对象
     * @param charID 会话id
     * @param clientId 客户端id
     * @param conversationSignature 会话签名
     * @param theChatType 聊天类型 accurate 或 balance 或 create
     * @param invocationId 对话id，就是这是第几次对话 可以不传
     * */
    constructor(bingChat,charID, clientId, conversationSignature, theChatType,invocationId) {
        this.bingChat = bingChat;
        this.sendMessageManager = new SendMessageManager(bingChat,charID, clientId, conversationSignature,invocationId);
        if (theChatType) {
            this.sendMessageManager.setChatType(theChatType);
        }
    }
    /**
     * @param message String 发送的消息
     * @param onMessage function 当收到消息时的回调函数
     * @return ReturnMessage
     * @throws Error
     */
    //(string,function:可以不传)
    async sendMessage(message, onMessage) {
        let restsrstUrl;
        if(window.location.protocol==='http:'||window.location.protocol==='https:'){
            restsrstUrl = `${window.location.origin.replace('http','ws')}/sydney/ChatHub`;
        }else {
            let re = await nBGGFetch(`${window.location.origin}/sydney/ChatHubUrl`);
            restsrstUrl = await re.text();
        }
        try {
            let chatWebSocket = new WebSocket(restsrstUrl);
            chatWebSocket.onopen = () => {
                this.sendMessageManager.sendShakeHandsJson(chatWebSocket);
                this.sendMessageManager.sendChatMessage(chatWebSocket, message);
            }
            return new ReturnMessage(chatWebSocket, onMessage);
        } catch (e) {
            console.warn(e);
            throw new Error("无法连接到web服务器，请刷新页面重试:" + e.message);
        }
    }
}