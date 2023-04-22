var chat = document.getElementById('chat');
var chatTypeDiv = document.getElementById('chatTypeDiv');
var goGoSubtitle = document.getElementById('goGoSubtitle');
var docTitle = document.getElementById('docTitle');
var input_text = document.getElementById('input');
var send_button = document.getElementById('send');
let restartNewChat = document.getElementById('restartNewChat');
let expand = document.getElementById("expand");
var thisChatType;

function getCurrentTime() {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    return year + "-" + month + "-" + day + " " + hours + "-" + minutes + "-" + seconds;
}



//(string)
function addError(message) {
    let go = document.createElement('div');
    go.classList.add('error');
    go.innerHTML = message;
    chat.appendChild(go);
}

//尝试获取聊天权限按钮
function addNoPower() {
    let go = document.createElement('div');
    go.classList.add('NoPower');
    go.innerText = '>>> 点击尝试申请加入候补名单获取NewBing聊天权限 <<<';
    chat.appendChild(go);
    go.onclick = () => {
        if (go.geting) {
            return;
        }
        go.geting = true;
        go.innerHTML = '正在请求申请加入候补名单..';
        getPower().then((rett) => {
            if (rett.ok == true) {
                go.innerHTML = '请求成功！请刷新页面重试，如果无权限使用请等待几天后重试。'
                return;
            }
            go.innerHTML = '发生错误：' + rett.message;
        });
    }
}

//添加去登录按钮
function addNoLogin() {
    let go = document.createElement('a');
    go.classList.add('NoPower');
    go.innerText = '>>> 点击跳转到登录页面 <<<';
    go.style.display = 'block';
    chat.appendChild(go);
    go.href = 'https://login.live.com/login.srf?wa=wsignin1.0&rpsnv=13&id=264960&wreply=https%3A%2F%2Fcn.bing.com%2Fsecure%2FPassport.aspx%3Fedge_suppress_profile_switch%3D1%26requrl%3Dhttps%253a%252f%252fcn.bing.com%252f%253fwlexpsignin%253d1&wp=MBI_SSL&lc=2052&aadredir=1';
    go.target = '_blank';
}

let onMessageIsOKClose = false;
//(json)
function onMessage(json, returnMessage) {
    if (json.type == "close") {
        isSpeakingFinish();
        if (!onMessageIsOKClose) {
            addError("聊天异常中断了！可能是网络问题。");
        }
        return;
    }
    if (json.type == 'error') {
        addError("连接发生错误：" + json.mess);
        return;
    }
    onMessageIsOKClose = false
    if (json.type == 3) {
        onMessageIsOKClose = true;
        returnMessage.getCatWebSocket().close(1000, 'ok');
    } else if (json.type == 1) {
        porserArguments(json.arguments);
    } else if (json.type == 2) {
        porserType2Item(json.item);
    } else {
        console.log(JSON.stringify(json));
    }
}


//页面逻辑



//全局变量
var talk;
var returnMessage;
var isSpeaking = false;


/**正在创建聊天 */
function isAskingToMagic() {
    isSpeaking = true;
    goGoSubtitle.innerText = '正在连接到魔法. 稍等！';
    send_button.value = '施法中.';
}

//重写porserTextBlock函数
/*
解析TextBlock body.type==TextBlock
*/
function porserTextBlock(body, father) {
    if (!body.size) {
        let div = getByClass('textBlock', 'div', father, 'markdown-body');
        div.innerHTML = marked.marked(completeCodeBlock(body.text));
        renderMathInElement(div,renderMathInElementOptions);
        let aaas = div.getElementsByTagName('a');
        //将超链接在新页面打开
        for(let i=0;i<aaas.length;i++){
            aaas[i].target = '_blank';
        }
        //如果是注释则加上上标样式
        for(let i=0;i<aaas.length;i++){
            let reg = new RegExp('^\\^(\\d+)\\^$');
            if(reg.test(aaas[i].innerHTML)){
                aaas[i].innerHTML = aaas[i].innerHTML.replace(reg,'$1');
                aaas[i].classList.add('superscript');
            }
        }
    } else if (body.size == 'small') {
        //原本bing官网的small并没有输出
    }
}

/**重写函数 */
function isSpeakingStart(chatWithMagic, sendText) {
	isSpeaking = true;
	if (chatWithMagic == undefined) {
		goGoSubtitle.innerText = '准备开始创作.';
	} else if (chatWithMagic) {
		goGoSubtitle.innerText = '正在魔法创作.';
	} else {
		goGoSubtitle.innerText = 'bing正在创作.';
	}
	if (sendText) {
		docTitle.innerText = sendText;
	}
	send_button.value = '响应中.';
}
//重写
function isSpeakingFinish() {
	send_button.value = '生成草稿';
	goGoSubtitle.innerText = '正在保存聊天记录';
	//回复结束,调用自动保存聊天记录
	goGoSubtitle.innerText = '可以啦！来发送下一条消息吧！';
	isSpeaking = false;
}

/**重写重置聊天到初始状态函数 */
function reSetStartChatMessage(type) {
    chat.innerHTML = ``;
    goGoSubtitle.innerText = '想创作什么文章呢？我来帮你！';
}


async function send(text) {
    reSetStartChatMessage();
    talk = undefined;
    if (isSpeaking) {
        return;
    }
    if (!talk) {
        isAskingToMagic();
        let r = await createChat(thisChatType);
        if (!r.ok) {
            addError(r.message);
            if (r.type == 'NoPower') {
                addNoPower();
            }
            if (r.type == 'NoLogin') {
                addNoLogin();
            }
            isSpeakingFinish();
            return;
        }
        talk = r.obj;
    }
    isSpeakingStart();
    let r = await talk.sendMessage(text, onMessage)
    if (!r.ok) {
        isSpeakingFinish();
        addError(r.message);
        return;
    }
    returnMessage = r.obj;
    isSpeakingStart(r.chatWithMagic, text);
}

//重写send按钮点击事件
send_button.onclick = () => {
	if (isSpeaking) {
		return;
	}
	let text = input_text.value;
	if (!text) {
		alert('什么都没有输入呀！');
		return;
	}
	send(text);
};







//默认平衡
thisChatType = 'balance';


// "resourceTypes": [
// 	"main_frame",
// 	"sub_frame",
// 	"stylesheet",
// 	"script",
// 	"image",
// 	"font",
// 	"object",
// 	"xmlhttprequest",
// 	"ping",
// 	"csp_report",
// 	"media",
// 	"websocket",
// 	"webtransport",
// 	"webbundle",
// 	"other"
//   ]


















//页面加载完成之后执行
window.addEventListener('load', () => {
    reSetStartChatMessage();
});





