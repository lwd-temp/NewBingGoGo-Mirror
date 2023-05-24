import MagicURL from "./module_plug/MagicURL.js";
import uRLTrue from "./module_plug/uRLTrue.js";

const url_input = document.querySelector('input#url-input');
const speak = document.querySelector('p#speak');
const tallSelect = document.querySelector('select#tallSelect');
const thisVersion = document.getElementById('thisVersion');
const lastVersion = document.getElementById('lastVersion');
const getPublicUrl = document.getElementById('getPublicUrl');
const selectPublicUrl = document.getElementById('selectPublicUrl');
const thisOpenBingGoGo = document.getElementById('this-open-bing-go-go');
const okGitUrl = document.getElementById('okGitUrl');
const okGitUrlNo = document.getElementById('okGitUrlNo');
const okGitUrlGo = document.getElementById('okGitUrlGo');
const thisOpenWrite = document.getElementById('this-open-write');

let magicUrl;

function speakString() {
    if (!magicUrl) {
        speak.innerHTML = '我没有角角,需要魔法链接才能帮你哦。';
        return;
    }
    try {
        magicUrl= uRLTrue(magicUrl)
        url_input.value = magicUrl;
    }catch (error){
        speak.innerHTML = '魔法链接似乎不太对。';
        return;
    }
    speak.innerHTML = '魔法启动！';
}

MagicURL.getMagicUrl().then((v) => {
    url_input.value = v ? v : '';
    magicUrl = v;
    speakString(v);
    loaded();
});


MagicURL.getChatHubWithMagic().then((chatWithMagic) => {
    if (chatWithMagic === true) {
        tallSelect.selectedIndex = 1;
    } else {
        tallSelect.selectedIndex = 0;
    }
    tallSelect.onchange = () => {
        switch (tallSelect.selectedIndex) {
            case 0:
                MagicURL.setChatHubWithMagic(false).then();
                break;
            case 1:
                MagicURL.setChatHubWithMagic(true).then();
                break;
        }
    }
});



function loaded() {
    //魔法链接输入框更新事件
    url_input.onchange = function () {
        let url = url_input.value;
        magicUrl = url;
        MagicURL.setMagicUrl(url).then();
        speakString();
    }

    //插入窗口到当前浏览器标签
    thisOpenBingGoGo.onclick = () => {
        insertRightChatToThisTab().then();
    }

    //插入窗口到浏览器标签
    thisOpenWrite.onclick = ()=>{
        insertWriteToThisTab().then();
    }

    //获取公共魔法链接
    getPublicUrl.onclick = async () => {
        //弹出确认框
        okGitUrl.style.display = 'block';
    }

    //获取公共魔法链接
    okGitUrlGo.onclick = async ()=>{
        okGitUrl.style.display = 'none';
        try {
            getPublicUrl.innerText = '正在获取..'
            let res = await fetch('https://gitee.com/jja8/NewBingGoGo/raw/master/publicUrl.json');
            let json = await res.json();
            selectPublicUrl.innerHTML = `<option value="${magicUrl}">(使用私有魔法链接)</option>`;
            for (let the in json) {
                let op = document.createElement('option');
                op.innerText = json[the].name;
                op.value = json[the].url;
                selectPublicUrl.appendChild(op);
            }
            getPublicUrl.style.display = 'none';
            selectPublicUrl.style.display = 'block';
        } catch (e) {
            console.warn(e);
            getPublicUrl.innerText = '获取失败';
        }
    }
    //取消获取公共魔法链接
    okGitUrlNo.onclick = async () => {
        //隐藏提示框
        okGitUrl.style.display = 'none';
    }

    //选择公共魔法链接
    selectPublicUrl.onchange = () => {
        if (selectPublicUrl.value) {
            url_input.value = selectPublicUrl.value;
        } else {
            url_input.value = magicUrl;
        }
        url_input.onchange();
    }


    async function versionload() {
        //获取最新版本号和当前版本号
        try {
            let res = await fetch(chrome.runtime.getURL('manifest.json'));
            let json = await res.json();
            thisVersion.innerText = json.version;
        } catch (e) {
            console.warn(e);
            thisVersion.innerText = '获取失败';
        }

        try {
            let res = await fetch('https://gitee.com/jja8/NewBingGoGo/raw/master/manifest.json');
            let json = await res.json();
            lastVersion.innerText = json.version;
        } catch (e) {
            console.warn(e);
            lastVersion.innerText = '获取失败';
        }
    }
    versionload().then();
}
