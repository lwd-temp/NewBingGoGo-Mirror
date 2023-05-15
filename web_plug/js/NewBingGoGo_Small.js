import ChatSuggestionsWorker from '../../web/js/module/ChatMessage/ChatSuggestionsWorker.js'
import CueWordWorker from '../../web/js/module/CueWordWorker.js'
import ParserReturnWorker from '../../web/js/module/ChatMessage/ParserReturnWorker.js'
import TitleWorker from '../../web/js/module/TitleWorker.js'
import ChatModeSwitchingWorker from '../../web/js/module/ChatModeSwitchingWorker.js'
import WindowScrollingWorker from "../../web/js/module/WindowScrollingWorker.js";
import BingChat from '../../web/js/module/BingChat/BingChat.js';
import SwitchWorker from "../../web/js/module/SwitchWorker.js";
import ChatRecordWorker from "../../web/js/module/ChatRecord/ChatRecordWorker.js";
import ChatFirstMessages_Small from "./module_plug/BingChat/ChatFirstMessages_Small.js";
import ChatOptionsSets_Small from "./module_plug/BingChat/ChatOptionsSets_Small.js";

//页面加载完成之后执行
window.addEventListener('load',()=>{
    //窗口更新滚动
    new WindowScrollingWorker(document.getElementById('chat'));
    const bingChat = new BingChat(new ChatFirstMessages_Small(),new ChatOptionsSets_Small()); //聊天对象 BingChat 对象
    //加载需要用到的对象
    const chatSuggestionsManager = new ChatSuggestionsWorker(
        document.getElementById('SearchSuggestions')//聊天建议dom
    );
    const parserReturnMessage = new ParserReturnWorker(
        document.getElementById('chat'),
        chatSuggestionsManager
    );
    const chatModeSwitchingManager = new ChatModeSwitchingWorker(
        document.body,
        document.getElementById('chatTypeChoseCreate'),
        document.getElementById('chatTypeChoseBalance'),
        document.getElementById('chatTypeChoseAccurate'),
        document.getElementById('chatTypeDiv')
    );

    const cueWordManager = new CueWordWorker(
        document.getElementById("cueWord-selects-list"),//提示词列表dom
        document.getElementById("cueWord-selected"),//已选择的提示词mod
        document.getElementById("cueWord-search-input")//提示词搜索输入框dom
    );
    cueWordManager.url = '../web/resource/CueWord.json';

    const titleManager = new TitleWorker(
        document.getElementById('goGoSubtitle')
    );

    const inputMaxSwitch = new SwitchWorker(
        document.getElementById("expand"),
        document.getElementById("tail")
    );

    //聊天记录
    const chatRecordWorker = new ChatRecordWorker(
        bingChat,
        chatModeSwitchingManager,
        chatSuggestionsManager,
        parserReturnMessage,
        document.getElementById('ChatRecordsListDiv'),
        document.getElementById('ChatRecordsServer')
    );

    //聊天记录显示和关闭显示的开关
    const chatRecordShowSwitch = new SwitchWorker(
        document.getElementById('showChatRecords'),
        document.getElementById('ChatRecordsListDivOut'),
        (ch)=>{
            if(ch){
                chatRecordWorker.updateList();
            }
        }
    );


    //获取需要用到的元素
    const restart_button = document.getElementById('restart');
    const input_text = document.getElementById('input');
    const send_button = document.getElementById('send');


    //定义需要用到的变量
    let returnMessage; //聊天返回对象
    let isSpeaking = false; //是否正在接收消息
    let previewMessageID = undefined; //预览消息id，如果没有预览消息就undefined


    //当打开聊天记录时
    chatRecordWorker.onOpenChatRecord = (event)=>{
        if(isSpeaking){
            event.isCanExecute =false;
            alert("请等待本次对话结束。")
            return;
        }
        if (returnMessage) {
            returnMessage.close();
            returnMessage = undefined;
        }
    }

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


    /**重置聊天框和聊天建议到初始状态 */
    async function reSetStartChatMessage() {
        parserReturnMessage.restart(await bingChat.chatFirstMessages.nextStartMessage());
        chatSuggestionsManager.set(await bingChat.chatFirstMessages.nextStartProposes());
        titleManager.restart();
    }
    chatModeSwitchingManager.onChatTypeChange = (type,isUser)=>{
        if(isUser){
            reSetStartChatMessage().then();
        }
    };


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

    /**
     * 发送消息
     * @param text {string}
     * */
    async function send(text) {
        if (isSpeaking) {
            return;
        }
        chatModeSwitchingManager.hide();
        parserReturnMessage.setMyChat(text,previewMessageID,false);
        previewMessageID = undefined;
        if (!bingChat.isStart()) {
            isAskingToMagic();
            try {
                await bingChat.start(chatModeSwitchingManager.chatType);
            }catch (error){
                console.warn(error);
                parserReturnMessage.addError(error.message);
                isSpeakingFinish();
                if(window.location.protocol==="chrome-extension:"){
                    if(error.type==='NoLogin'){
                        parserReturnMessage.addNoLogin();
                    }else if (error.type==='NoPower'){
                        parserReturnMessage.addNoPower();
                    }
                }
                return;
            }
        }
        try {
            isSpeakingStart();
            returnMessage = await bingChat.sendMessage(text, parserReturnMessage.getOnMessageFun((even)=>{
                if (even.type==='close'||even.type==='close-accident'||even.type==='error') {
                    isSpeakingFinish();
                    //保存聊天记录
                    if(chatRecordWorker.isOpen()){
                        chatRecordWorker.save();
                    }
                }
            }));
            isSpeakingStart(text);
        }catch (error){
            console.warn(error);
            isSpeakingFinish();
            parserReturnMessage.addError(error.message);
        }
    }
    chatSuggestionsManager.onSend = send;

    /**
     * 提示词改变也预览
     * */
    cueWordManager.onChange = ()=>{
        onPreview();
    }

    /**
     * 获取消息
     * */
    function getSendMessage(){
        let text = input_text.value;
        //连接提示词
        return  cueWordManager.getCutWordString(text);
    }

    /**
     * 当预览时候
     * */
    function onPreview(){
        previewMessageID = parserReturnMessage.setMyChat(getSendMessage(),previewMessageID,true);
        input_update_input_text_sstyle_show_update();
    }

    /**
     * 当发送时候
     * */
    function onSend(){
        if (isSpeaking) {
            return;
        }
        let text = getSendMessage();
        //清空输入框
        input_text.value = '';
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
        if (returnMessage) {
            returnMessage.close();
            returnMessage = undefined;
        }
        bingChat.end();
        isSpeakingFinish();
        reSetStartChatMessage().then();
        chatModeSwitchingManager.show();
        chatRecordWorker.close();
        chatRecordWorker.updateList();
    };


    //发送按钮出现逻辑
    function input_update_input_text_sstyle_show_update() {
        if (getSendMessage()) {
            send_button.style.opacity = '1';
        } else {
            send_button.style.opacity = '0';
        }
    }
    input_text.addEventListener("input", ()=>{
        onPreview();
    });




    reSetStartChatMessage().then();
    input_update_input_text_sstyle_show_update();
    cueWordManager.loadcueWorld().then();
});








