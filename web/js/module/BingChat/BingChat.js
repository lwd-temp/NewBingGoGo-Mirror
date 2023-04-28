import ChatFirstMessages from "./ChatFirstMessages.js";
import ChatOptionsSets from "./ChatOptionsSets.js";
import nBGGFetch from "../nBGGFetch.js";
import BingChating from "./BingChating.js";

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
     * @return boolean
     * */
    isStart(){
        return !!this.bingChating;
    }

    /**
     * 发送消息
     * @param text 消息文本
     * @param onMessage 当bing回复时的回调函数
     * @return ReturnMessage
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
     @return BingChat
     @throws Error
     */
    async start(theChatType) {
        if (this.isStart()){
            throw new Error("聊天已经开始了，需要使用end方法结束后再重新开始。");
        }
        let res
        try {
            res = await nBGGFetch(`${window.location.origin}/turing/conversation/create`);
        } catch (e) {
            console.warn(e);
            throw e.isNewBingGoGoError?e:new Error("无法连接到web服务器，请刷新页面重试:" + e.message);
        }
        let cookieID = res.headers.get("cookieID");
        let rText = await res.text();
        if(rText.length<1){
            throw new Error(`服务所在地区无法使用或cookie失效，第${cookieID}个账号。`);
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
                mess = `cookie失效，第${cookieID}个cookie。`;
            } else if (resjson.result.value === 'Forbidden') {
                type = 'NoPower'
                mess = `cookie无权限，第${cookieID}个cookie。`;
            }
            let error = new Error(mess);
            error.type = type;
            throw error;
        }
        this.bingChating = new BingChating(this,resjson.conversationId, resjson.clientId, resjson.conversationSignature, theChatType);
        return this;
    }

}