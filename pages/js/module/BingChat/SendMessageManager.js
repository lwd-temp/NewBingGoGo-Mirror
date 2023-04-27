/**
 * 处理发送消息的类
 * */
class SendMessageManager{
    bingChat;
    invocationId;
    conversationId;
    clientId;
    conversationSignature;
    optionsSets;
    //(会话id，客户端id，签名id，是否是开始)
    //(string,string,string,boolena)
    constructor(bingChat,conversationId, clientId, conversationSignature,invocationId) {
        this.bingChat = bingChat;
        this.invocationId = invocationId===undefined?1:invocationId;
        this.conversationId = conversationId;
        this.clientId = clientId;
        this.conversationSignature = conversationSignature;
        this.optionsSets = 'balance';
    }

    //chatTypes中的一种
    setChatType(chatType) {
        this.optionsSets = chatType;
    }

    //发送json数据
    async sendJson(chatWebSocket, json) {
        let go = JSON.stringify(json) + '\u001e';
        await chatWebSocket.send(go);
        console.log('发送', go)
    }
    //获取用于发送的握手数据
    //(WebSocket)
    async sendShakeHandsJson(chatWebSocket) {
        await this.sendJson(chatWebSocket, {
            "protocol": "json",
            "version": 1
        });
    }
    //获取用于发送的聊天数据
    //(WebSocket,sreing)
    async sendChatMessage(chatWebSocket, chat) {
        let optionsSets = this.bingChat.chatOptionsSets.chatTypes[this.optionsSets];
        if(!optionsSets){
            optionsSets = this.bingChat.chatOptionsSets.chatTypes.balance;
            console.warn("不存在的ChatType",this.optionsSets);
        }

        let json = {
            "arguments": [{
                "source": this.bingChat.chatOptionsSets.source,
                "optionsSets": optionsSets,
                "allowedMessageTypes": this.bingChat.chatOptionsSets.allowedMessageTypes,
                "sliceIds": this.bingChat.chatOptionsSets.sliceIds,
                "verbosity": "verbose",
                "traceId": this.getUuidNojian(),
                "isStartOfSession": (this.invocationId <= 1),
                "message": await this.bingChat.chatOptionsSets.generateMessages(this,chat),
                "conversationSignature": this.conversationSignature,
                "participant": {
                    "id": this.clientId
                },
                "conversationId": this.conversationId,
                "previousMessages": (this.invocationId <= 1) ? await this.bingChat.chatOptionsSets.getPreviousMessages() : undefined
            }],
            "invocationId": this.invocationId.toString(),
            "target": "chat",
            "type": 4
        };
        await this.sendJson(chatWebSocket, json);
        this.invocationId++;
    }
    getUuidNojian() {
        return URL.createObjectURL(new Blob()).split('/')[3].replace(/-/g, '');
    }
}
export default SendMessageManager;