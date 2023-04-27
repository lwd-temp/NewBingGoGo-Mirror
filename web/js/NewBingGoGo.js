import ChatSuggestionsManager from './module/ChatSuggestionsManager.js'
import CueWordManager from './module/CueWordManager.js'
import ParserReturnMessage from './module/ParserReturnMessage.js'
import TitleManager from './module/TitleManager.js'
import ChatModeSwitchingManager from './module/ChatModeSwitchingManager.js'
import WindowScrolling from "./module/windowScrolling.js";
import BingChat from './module/BingChat.js';
import Switch from "./module/Switch.js";

//页面加载完成之后执行
window.addEventListener('load',()=>{

    //窗口更新滚动
    new WindowScrolling(document.getElementById('chat'));
    //加载需要用到的对象
    const parserReturnMessage = new ParserReturnMessage(
        document.getElementById('chat')
    );
    const chatModeSwitchingManager = new ChatModeSwitchingManager(
        document.body,
        document.getElementById('chatTypeChoseCreate'),
        document.getElementById('chatTypeChoseBalance'),
        document.getElementById('chatTypeChoseAccurate'),
        document.getElementById('chatTypeDiv')
    );
    const chatSuggestionsManager = new ChatSuggestionsManager(
        document.getElementById('SearchSuggestions')//聊天建议dom
    );
    const cueWordManager = new CueWordManager(
        document.getElementById("cueWord-selects-list"),//提示词列表dom
        document.getElementById("cueWord-selected"),//已选择的提示词mod
        document.getElementById("cueWord-search-input")//提示词搜索输入框dom
    );
    const titleManager = new TitleManager(
        document.getElementById('goGoSubtitle')
    );

    const inputMaxSwitch = new Switch(
        document.getElementById("expand"),
        document.getElementById("tail")
    );

    //获取需要用到的元素
    const restart_button = document.getElementById('restart');
    const input_text = document.getElementById('input');
    const send_button = document.getElementById('send');


    //定义需要用到的变量
    let onMessageIsOKClose = false;//消息是否正常接收完毕
    const talk = new BingChat(); //聊天对象 BingChat 对象
    let returnMessage; //聊天返回对象
    let isSpeaking = false; //是否正在接收消息


    //回车键发送 ctrl+回车换行
    input_text.addEventListener('keydown', (event) => {
        //如果是展开状态就使用默认换行逻辑
        if (inputMaxSwitch.open) {
            return;
        }
        if (event.key === 'Enter' && !event.altKey) {
            event.preventDefault();
            //调用发送消息的函数
            onSend();
        } else if (event.key === 'Enter' && event.altKey) {
            event.preventDefault();
            // 插入换行符s
            input_text.value += "\n";
        }
    });


    function onMessage(json, returnMessage) {
        if (json.type === "close") {
            isSpeakingFinish();
            if (!onMessageIsOKClose) {
                parserReturnMessage.addError("聊天异常中断了！可能是网络问题。");
            }
            return;
        }
        if (json.type === 'error') {
            parserReturnMessage.addError("连接发生错误：" + json.mess);
            return;
        }
        onMessageIsOKClose = false
        if (json.type === 3) {
            onMessageIsOKClose = true;
            returnMessage.getCatWebSocket().close(1000, 'ok');
        } else if (json.type === 1) {
            parserReturnMessage.porserArguments(json.arguments);
        } else if (json.type === 2) {
            parserReturnMessage.porserType2Item(json.item);
        } else {
            console.log(JSON.stringify(json));
        }
    }

    /**重置聊天框和聊天建议到初始状态 */
    async function reSetStartChatMessage(type) {
        parserReturnMessage.restart(await talk.chatFirstMessages.nextStartProposes(type));
        chatSuggestionsManager.set(await talk.chatFirstMessages.nextStartProposes());
        titleManager.restart();
    }
    chatModeSwitchingManager.onChatTypeChange = reSetStartChatMessage;


    /**正在创建聊天 */
    function isAskingToMagic() {
        isSpeaking = true;
        titleManager.onCreating();
        send_button.value = '施法中.';
        chatSuggestionsManager.clear()
    }

    /**bing正在回复 */
    function isSpeakingStart(sendText) {
        isSpeaking = true;
        if (sendText) {
            titleManager.setPageTitleText(sendText);
            titleManager.onAnswering(sendText);
        }else {
            titleManager.onSending()
        }
        send_button.value = '响应中.';
        chatSuggestionsManager.clear();
    }

    /**bing回复结束 */
    function isSpeakingFinish() {
        send_button.value = '发送';
        titleManager.waitingNext();
        isSpeaking = false;
    }

    async function send(text) {
        if (isSpeaking) {
            return;
        }
        chatModeSwitchingManager.hide();
        parserReturnMessage.addMyChat(text);
        if (!talk.isStart()) {
            isAskingToMagic();
            try {
                await talk.start(chatModeSwitchingManager.thisChatType);
            }catch (error){
                console.warn(error);
                parserReturnMessage.addError(error.message);
                isSpeakingFinish();
                return;
            }
        }
        try {
            isSpeakingStart();
            returnMessage = await talk.sendMessage(text, onMessage);
            isSpeakingStart(text);
        }catch (error){
            console.warn(error);
            isSpeakingFinish();
            parserReturnMessage.addError(error.message);
        }
    }
    chatSuggestionsManager.onSend = send;

    function onSend(){
        if (isSpeaking) {
            return;
        }
        let text = input_text.value;
        input_text.value = '';
        //连接提示词
        text = text+cueWordManager.getCutWordString();
        //清空提示词
        cueWordManager.clearCutWordString();

        //显示逻辑
        input_update_input_text_sstyle_show_update({ target: input_text });
        if (!text) {
            alert('什么都没有输入呀！');
            return;
        }

        //发送
        send(text).then();

        //关闭大输入框
        inputMaxSwitch.open = false;
    }
    send_button.onclick = onSend;


    //开始新主题
    restart_button.onclick = () => {
        onMessageIsOKClose = true;
        if (returnMessage) {
            returnMessage.getCatWebSocket().close(1000, 'ok');
            returnMessage = undefined;
        }
        talk.end();
        isSpeakingFinish();
        reSetStartChatMessage().then();
        chatModeSwitchingManager.show();

    };


    //发送按钮出现逻辑
    function input_update_input_text_sstyle_show_update(v) {
        if (v.target.value) {
            send_button.style.opacity = '1';
        } else {
            send_button.style.opacity = '0';
        }
    }
    input_text.addEventListener("input", input_update_input_text_sstyle_show_update);




    reSetStartChatMessage().then();
    input_update_input_text_sstyle_show_update({ target: input_text });
    cueWordManager.loadcueWorld().then();
});








