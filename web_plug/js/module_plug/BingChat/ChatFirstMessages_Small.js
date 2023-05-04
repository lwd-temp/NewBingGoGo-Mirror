/**
 * 获取bing第一条消息的类
 * */
export default class ChatFirstMessages_Small {
    bingmMessages = [
        '欢迎回来! 你想要讨论什么?'
    ]

    StartMessage = this.bingmMessages[0];
    Proposes = [];
    /**
     获取建议消息
     @return String[]
     */
    async nextStartProposes(){
        return this.Proposes;
    }
    /**
    获取bing的第一条消息
     @return string
    */
    async nextStartMessage(){
        return this.StartMessage = this.bingmMessages[Math.floor(Math.random() * this.bingmMessages.length)];
    }

    /**
     * @return string
     * */
    getStartMessage(){
        return this.StartMessage;
    }

    /**
     * @return string[]
     */
    getStartProposes(){
        return this.Proposes;
    }
}