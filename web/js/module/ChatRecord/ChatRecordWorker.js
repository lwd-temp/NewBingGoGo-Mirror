/**
 * 聊天记录的工作类
 * */
export default class ChatRecordWorker{
    /**
     * 聊天对象
     */
    bingChat;
    /**
     * 聊天模式切换对象
     */
    chatModeSwitchingWorker;
    /**
     * 聊天建议对象
     */
    chatSuggestionsWorker;
    /**
     * 消息显示对象
     */
    parserReturnWorker;
    /**
     * 装聊天记录的div
     */
    chatRecordDIV;

    constructor(bingChat, chatModeSwitchingWorker, chatSuggestionsWorker, parserReturnWorker, chatRecordDIV) {
        this.bingChat = bingChat;
        this.chatModeSwitchingWorker = chatModeSwitchingWorker;
        this.chatSuggestionsWorker = chatSuggestionsWorker;
        this.parserReturnWorker = parserReturnWorker;
        this.chatRecordDIV = chatRecordDIV;
    }
}