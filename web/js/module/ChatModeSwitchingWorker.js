/**
 * 聊天模式的切换的管理类
 * */
export default class ChatModeSwitchingWorker {
    static ChatType = {
        create:'create',
        balance:'balance',
        accurate:'accurate'
    };
    backgroundDIV;   //背景div
    chatTypeChoseCreate;  //聊天选项有创造力按钮
    chatTypeChoseBalance; //聊天选项平衡按钮
    chatTypeChoseAccurate; //聊天选项精确按钮
    chatTypeDiv; //全部按钮的父元素
    //默认平衡
    thisChatType = ChatModeSwitchingWorker.ChatType.balance;
    constructor(backgroundDIV,chatTypeChoseCreate,chatTypeChoseBalance,chatTypeChoseAccurate,chatTypeDiv) {
        this.backgroundDIV = backgroundDIV;
        this.chatTypeChoseCreate = chatTypeChoseCreate;
        this.chatTypeChoseBalance = chatTypeChoseBalance;
        this.chatTypeChoseAccurate = chatTypeChoseAccurate;
        this.chatTypeDiv = chatTypeDiv;

        //创造力模式
        chatTypeChoseCreate.onclick = () => {
            if (chatTypeDiv.style.opacity === '0') {
                return;
            }
            this.setChatModType(ChatModeSwitchingWorker.ChatType.create);
            //reSetStartChatMessage(ChatModeSwitchingWorker.ChatType.create);
        }
        //平衡模式
        chatTypeChoseBalance.onclick = () => {
            if (chatTypeDiv.style.opacity === '0') {
                return;
            }
            this.setChatModType(ChatModeSwitchingWorker.ChatType.balance);
            // reSetStartChatMessage(ChatModeSwitchingWorker.ChatType.balance);
        }
        //准确模式
        chatTypeChoseAccurate.onclick = () => {
            if (chatTypeDiv.style.opacity === '0') {
                return;
            }
            this.setChatModType(ChatModeSwitchingWorker.ChatType.accurate);
            // reSetStartChatMessage(ChatModeSwitchingWorker.ChatType.accurate);
        }
    }

    //设置聊天模式
    /**
     * @param chatType 聊天选项，ChatModeSwitchingWorker.ChatType中的一种
     * */
    setChatModType(chatType){
        if(this.thisChatType === chatType){
            return;
        }
        if (chatType === ChatModeSwitchingWorker.ChatType.create) {//有创造力的
            this.thisChatType = ChatModeSwitchingWorker.ChatType.create;
            this.chatTypeChoseCreate.classList.add('Chose');
            this.chatTypeChoseBalance.classList.remove('Chose');
            this.chatTypeChoseAccurate.classList.remove('Chose');
            this.backgroundDIV.classList.remove('b','c');
            this.backgroundDIV.classList.add('a');
        } else if (chatType === ChatModeSwitchingWorker.ChatType.balance) {//平衡
            this.thisChatType = ChatModeSwitchingWorker.ChatType.balance;
            this.chatTypeChoseCreate.classList.remove('Chose');
            this.chatTypeChoseBalance.classList.add('Chose');
            this.chatTypeChoseAccurate.classList.remove('Chose');
            this.backgroundDIV.classList.remove('a','c');
            this.backgroundDIV.classList.add('b');
        } else if (chatType === ChatModeSwitchingWorker.ChatType.accurate) {//精确的
            this.thisChatType = ChatModeSwitchingWorker.ChatType.accurate;
            this.chatTypeChoseCreate.classList.remove('Chose');
            this.chatTypeChoseBalance.classList.remove('Chose');
            this.chatTypeChoseAccurate.classList.add('Chose');
            this.backgroundDIV.classList.remove('a','b');
            this.backgroundDIV.classList.add('c');
        } else {
            console.warn("错误的聊天类型", chatType);
            return;
        }
        this.onChatTypeChange(chatType);
    }

    /**
     * 需要重写
     * 当聊天类型改变时调用
     * @param chatType 新的聊天类型
     * */
    onChatTypeChange(chatType){
        console.log(`onChatTypeChange方法没有被重写！,聊天类型切换到'${chatType}'`);
    }

    /**
     * 显示聊天模式选项
     * */
    show(){
        this.chatTypeDiv.style.opacity = '1';
    }

    /**
     * 隐藏聊天模式选项
     * */
    hide(){
        this.chatTypeDiv.style.opacity = '0';
    }
}