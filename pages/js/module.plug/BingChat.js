import SendMessageManager from "../module/BingChat/SendMessageManager.js";
import ReturnMessage from "../module/BingChat/ReturnMessage.js";
import ChatFirstMessages from "../module/BingChat/ChatFirstMessages.js";
import ChatOptionsSets from "../module/BingChat/ChatOptionsSets.js";
import MagicURL from "./MagicURL.js";
import URLTrue from "./URLTrue.js";

async function copyCookies(magicUrl) {
    let cookiesjson = [];
    let fr = [".bing.com"];
    for (let i = 0; i < fr.length; i++) {
        let cookies = await chrome.cookies.getAll({
            domain: fr[i]
        });
        cookies.map((m) => {
            cookiesjson[cookiesjson.length] = {
                domain: m.domain,
                name: m.name,
                value: m.value,
                path: m.path
            };
        });
    }
    for (let co in cookiesjson) {
        let r = {
            url: magicUrl,
            //domain: cookiesjson[co].domain,
            name: cookiesjson[co].name,
            value: cookiesjson[co].value,
            path: cookiesjson[co].path
        }
        await chrome.cookies.set(r);
    }
}

/**
 * 用于发送聊天消息和接受消息的对象
 * 使用 BingChat 创建
 */
class BingChating {
    /**
     * 对象
     */
    bingChat;
    sendMessageManager;

    //theChatType chatTypes变量中的其中一个
    //invocationId 可以不传
    //(string,ture|false|'repeat',string,string,string,theChatType,int|undefined)
    constructor(bingChat,charID, clientId, conversationSignature, theChatType,invocationId) {
        this.bingChat = bingChat;
        this.sendMessageManager = new SendMessageManager(bingChat,charID, clientId, conversationSignature,invocationId);
        if (theChatType) {
            this.sendMessageManager.setChatType(theChatType);
        }
    }
    /**
     * 返回 ReturnMessage 抛出异常信息错误
     * 参数 消息string,当收到消息的函数,当关闭时函数
     *
     */
    //(string,function:可以不传)
    async sendMessage(message, onMessage) {
        try {
            let restsrstUrl = `${window.location.origin.replace('http','ws')}/sydney/ChatHub`;
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


export default class BingChat{
    bingChating;
    chatFirstMessages = new ChatFirstMessages();
    chatOptionsSets = new ChatOptionsSets(this);


    /**
     * 结束当前会话
     * */
    end(){
        this.bingChating = undefined;
    }

    /**
     * 是否已经开始聊天
     * */
    isStart(){
        return !!this.bingChating;
    }

    /**
     * 发送消息
     * @param text 消息文本
     * @param onMessage 当bing回复时的回调函数
     * @return  返回消息处接收处理对象 ReturnMessage
     * */
    sendMessage(text, onMessage){
        if (!this.isStart()){
            throw new Error("聊天没有开始，需要先使用start方法开始聊天");
        }
        return this.bingChating.sendMessage(text, onMessage);
    }

    /**
     开始聊天
     @param theChatType 聊天选项 默认平衡
     */
    async start(theChatType) {
        if (this.isStart()){
            throw new Error("聊天已经开始了，需要使用end方法结束后再重新开始。");
        }
        //开始运行
        let magicUrl = URLTrue(await MagicURL.getMagicUrl());
        await copyCookies(magicUrl);
        //开始运行
        let res
        try {
            res = await fetch(`${magicUrl}/turing/conversation/create`);
        } catch (e) {
            console.warn(e);
            throw new Error("无法连接到魔法链接服务器:" + e.message);
        }
        let rText = await res.text();
        if(rText.length<1){
            throw new Error(`魔法链接服务所在地区无法使用NewBing，请更换魔法链接。`);
        }
        let resjson = JSON.parse(rText);
        if (!resjson.result) {
            console.warn(resjson);
            throw new Error("未知错误！");
        }
        if (resjson.result.value !== 'Success') {
            console.warn(resjson);
            let type = resjson.result.value;
            let mess = resjson.result.message;
            if (resjson.result.value === 'UnauthorizedRequest') {
                type = 'NoLogin'
                mess = '首先你需要在bing登录微软账号！请前往 https://cn.bing.com/ 登录微软账号。';
            } else if (resjson.result.value === 'Forbidden') {
                type = 'NoPower'
                mess = '你还没有获得NewBing的使用权限';
            }
            let error = new Error(mess);
            error.type = type;
            throw error;
        }
        this.bingChating = new BingChating(resjson.conversationId, resjson.clientId, resjson.conversationSignature, theChatType);
        return this;
    }

}