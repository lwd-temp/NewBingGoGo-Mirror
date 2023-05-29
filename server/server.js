let serverConfig = {};//用于预加载，来加速页面打开
let serverConfigOk = false;

self.addEventListener("fetch",function(event) {
    if (event.request.url.startsWith(chrome.runtime.getURL(''))){
        event.respondWith(handleRequest(event.request))
        return;
    }
   // console.log(event);
});


/**
 * 当链接更新时重新预加载
 * */
chrome.storage.onChanged.addListener(async (c,l) =>{
    if(l!=="local"){
        return;
    }
    if(!c.GoGoUrl){
        return;
    }
    loadServerConfig().then()
})
/**
 * 加载服务器配置
 * */
async function loadServerConfig(){
    if(serverConfigOk==='loading'){
        return;
    }
    serverConfigOk = 'loading'
    //先从本地加载
    try {
        serverConfig = await (await fetch(chrome.runtime.getURL('/web/resource/config.json'))).json();
    }catch (error){
        console.warn(error);
    }

    //去魔法链接服务加
    while (true){
        let conf;
        let mUrl
        try {
            mUrl = uRLTrue(await getMagicUrl());
            if (mUrl==="https://www.bing.com") {//如果用的官方
                serverConfigOk = true;
                serverConfig = {
                    "h1": "NewBingGoGo",
                    "h2": "正在使用bing官方服务聊天服务",
                    "p": "bing官方服务国内可能无法使用，需要搭配科学上网。"
                };
                return;
            }
            let re = await fetch(mUrl+'/web/resource/config.json');
            if(re && re.ok){
                conf = await re.json();
            }
        }catch (error){
            console.warn(error);
        }
        if(!mUrl){ // 如果没有魔法链接则加载失败
            serverConfigOk = false;
            return;
        }
        try {
            if(mUrl!==uRLTrue(await getMagicUrl())){//如果魔法链接变化了则重新加载
                continue;
            }
            if (!conf){//没有配置则加载失败
                serverConfigOk = false;
                return;
            }else {//否则加载成功
                serverConfig = conf;
                serverConfigOk = true;
                return;
            }
        }catch (error){//错误了则加载失败
            console.warn(error);
            serverConfigOk = false;
            return;
        }
    }
}
loadServerConfig().then();

async function handleRequest(request){
    let url = new URL(request.url);

    //提示词请求
    if(url.pathname==='/web/resource/cueWord.json'){
        let re;
        try {
            re = await fetch('https://gitee.com/jja8/NewBingGoGo/raw/master/web/resource/cueWord.json');
        }catch (error){
            console.warn(re);
        }
        if(!re || !re.ok){
            re = await fetch(chrome.runtime.getURL('/web/resource/cueWord.json'));
        }
        return re
    }

    //server配置请求
    if(url.pathname==='/web/resource/config.json'){
        if(!serverConfigOk){
            loadServerConfig().then();
        }
        return new Response(JSON.stringify(serverConfig),{
            status: 200,
            statusText: 'ok',
            headers: {
                "content-type": "application/json"
            }
        });
    }

    //web请求
    if (
        url.pathname.startsWith('/web/')||
        url.pathname.startsWith('/web_plug/')||
        url.pathname==='/favicon.ico'||
        url.pathname==='/manifest.json'
    ) { //web请求
        return await fetch(chrome.runtime.getURL(url.pathname));
    }

    if (url.pathname.startsWith('/rp')) { //显示AI画图错误提示图片
        url.hostname = "www.bing.com";
        return goUrl(request, url.toString(), {
            "X-forwarded-for":request.headers.get("randomAddress")
        },false);
    }

    try {//这里面都是需要魔法链接的


        if(url.pathname==='/sydney/ChatHubUrl'){ //请求url
            async function bingChatHub(isAddRandomAddress,isSetHeaderXFFIP,url){//修改请求头
                let randomAddress = request.headers.get("randomAddress");
                if(randomAddress){
                    if(isSetHeaderXFFIP){
                        await setWebSocketHeaderXFFIP(randomAddress,url);//设置XFFip
                    }else {
                        await setWebSocketHeaderXFFIP(undefined,undefined);//设置XFFip
                    }
                }
                if(isAddRandomAddress && randomAddress){
                    let p = new URLSearchParams();
                    p.append("randomAddress",randomAddress)
                    url = url+"?"+p.toString();
                }
                return new Response(url);
            }

            if(await getChatHubWithMagic()){
                let mUrl = uRLTrue(await getMagicUrl());
                if (mUrl==="https://www.bing.com"){//如果用的官方
                    return await bingChatHub(false,true,`wss://sydney.bing.com/sydney/ChatHub`);
                }
                await copyCookies(mUrl)
                return await bingChatHub(true,false,`${mUrl.replace('http','ws')}/sydney/ChatHub`);
            }else {
                return await bingChatHub(false,true,`wss://sydney.bing.com/sydney/ChatHub`);
            }
        }

        if (url.pathname==='/turing/conversation/create') { //创建聊天
            let mUrl = uRLTrue(await getMagicUrl()) ;
            if (mUrl==="https://www.bing.com"){//如果用的官方
                return await goUrl(request, `https://www.bing.com/turing/conversation/create`,{
                    "X-forwarded-for":request.headers.get("randomAddress")
                },false);
            }
            await copyCookies(mUrl);
            return await goUrl(request, `${mUrl}/turing/conversation/create`,undefined,true);
        }

        if(url.pathname==="/edgesvc/turing/captcha/create"){//请求验证码图片
            let mUrl = uRLTrue(await getMagicUrl()) ;
            if (mUrl==="https://www.bing.com"){//如果用的官方
                return await goUrl(request,`https://edgeservices.bing.com/edgesvc/turing/captcha/create`,{
                    "X-forwarded-for":request.headers.get("randomAddress")
                },false);
            }
            await copyCookies(mUrl)
            return await goUrl(request,`${mUrl}/edgesvc/turing/captcha/create`,undefined,true);
        }

        if(url.pathname==="/edgesvc/turing/captcha/verify"){//提交验证码
            let mUrl = uRLTrue(await getMagicUrl()) ;
            if (mUrl==="https://www.bing.com"){//如果用的官方
                return await goUrl(request,`https://edgeservices.bing.com/edgesvc/turing/captcha/verify?`+ url.search,{
                    "X-forwarded-for":request.headers.get("randomAddress")
                },false);
            }
            await copyCookies(mUrl)
            return await goUrl(request,`${mUrl}/edgesvc/turing/captcha/verify?`+ url.search,undefined,true);
        }

        if (url.pathname==='/msrewards/api/v1/enroll') { //加入候补
            let mUrl = uRLTrue(await getMagicUrl()) ;
            let addHeaders = {};
            let withR = true;
            if (mUrl==="https://www.bing.com") {//如果用的官方
                addHeaders = {
                    "X-forwarded-for":request.headers.get("randomAddress")
                }
                withR = false;
            }else {
                await copyCookies(mUrl)//不是官方则需要拷贝
            }
            return await goUrl(request, `${mUrl}/msrewards/api/v1/enroll`+url.search,addHeaders,withR);
        }

        if (url.pathname==='/images/create') { //AI画图
            let mUrl = uRLTrue(await getMagicUrl()) ;
            let addHeaders = {};
            let withR = true;
            if (mUrl==="https://www.bing.com") {//如果用的官方
                addHeaders = {
                    "X-forwarded-for":request.headers.get("randomAddress")
                }
                withR = false;
            }else {
                await copyCookies(mUrl)//不是官方则需要拷贝
            }
            return await goUrl(request, `${mUrl}/images/create`+url.search,addHeaders,withR);
        }

        if (url.pathname.startsWith('/images/create/async/results')) { //请求AI画图图片
            let mUrl = uRLTrue(await getMagicUrl());
            let addHeaders = {};
            let withR = true;
            if (mUrl==="https://www.bing.com") {//如果用的官方
                addHeaders = {
                    "X-forwarded-for":request.headers.get("randomAddress")
                }
                withR = false;
            }else {
                await copyCookies(mUrl)//不是官方则需要拷贝
            }
            let a = url.pathname.replace('/images/create/async/results', `${mUrl}/images/create/async/results`)+url.search;
            return await goUrl(request, a, addHeaders,withR);
        }
    }catch (error){
        console.warn(error);
        return getReturnError("发生错误，请尝试更换魔法链接。"+error.message,error.theType,error.theData);
    }

    return getRedirect('/web/NewBingGoGo.html');
}

async function getMagicUrl() {
    return (await chrome.storage.local.get('GoGoUrl')).GoGoUrl;
}


async function getChatHubWithMagic() {
    return !!(await chrome.storage.local.get('ChatHubWithMagic')).ChatHubWithMagic;
}


/**
 * 检查魔法链接是否正确
 * */
function uRLTrue(magicUrl) {
    if(!magicUrl){
        throw Error("魔法链接为空，请设置魔法链接！");
    }
    //如果结尾带 / 则去掉
    function mu(url){
        if (url.endsWith('/')) {
            url = url.substring(0,url.length-1);
        }
        return url;
    }
    //如果带协议头
    if (new RegExp('^(https?://)([-a-zA-z0-9]+\\.)+([-a-zA-z0-9]+)+\\S*$').test(magicUrl)){
        return mu(magicUrl);
    }
    //如果不带协议头
    if(new RegExp('^([-a-zA-z0-9]+\\.)+([-a-zA-z0-9]+)+\\S*$').test(magicUrl)){
        return mu("https://"+magicUrl);
    }
    //如果都不是
    throw Error("魔法链接不正确，请修改魔法链接！");
}


//请求某地址
/**
 * @param request {Request}
 * @param url {String}
 * @param addHeaders {Object}
 * @param withRandomAddress {boolean}
 * */
async function goUrl(request, url, addHeaders,withRandomAddress) {
    //构建 fetch 参数
    let fp = {
        method: request.method,
        headers: {}
    }
    //保留头部信息
    let dropHeaders = ["accept", "accept-language","accept-encoding"];
    if(withRandomAddress){
        dropHeaders[dropHeaders.length] = "randomAddress";
    }
    for (let dropHeader of dropHeaders) {
        if(request.headers.has(dropHeader)){
            fp.headers[dropHeader] = request.headers.get(dropHeader);
        }
    }

    if (addHeaders) {
        //添加头部信息
        for (let h in addHeaders) {
            fp.headers[h] = addHeaders[h];
        }
    }

    //添加X-forwarded-for
    // fp.headers['X-forwarded-for'] = `${getRndInteger(3,5)}.${getRndInteger(1,255)}.${getRndInteger(1,255)}.${getRndInteger(1,255)}`;

    let res = await fetch(url, fp);
    if(!res.ok){
        if(res.headers.has('cf-mitigated')){
            let usp =  new URLSearchParams();
            usp.append('redirect',chrome.runtime.getURL('/web/NewBingGoGo.html'));
            let mUrl = uRLTrue(await getMagicUrl());
            let challengeUrl = `${mUrl}/challenge?${usp.toString()}`
            let error = new Error(`<p>被质疑为恶意攻击,需要通过机器人校验。</p><p><a href="${challengeUrl}" target="_blank">点击前往校验。</a></p>`);
            error.theType = "cf-mitigated";
            error.theData = challengeUrl;
            throw error;
        }
        throw new Error(`请求被拒绝,错误代码:${res.status} 原因:${res.statusText}`);
    }
    let headers = new Headers(res.headers);
    headers.set("cookieID",'self');
    return new Response(res.body,{
        status:res.status,
        statusText:res.statusText,
        headers:headers
    });
}

async function copyCookies(magicUrl) {
    let cookies = await chrome.cookies.getAll({
        domain: "bing.com"
    });
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        await chrome.cookies.set({
            url: magicUrl,
            name:cookie.name,
            value:cookie.value,
            path:cookie.path,
            expirationDate:(new Date().getTime()/1000)+10 //10秒后过期
        })
    }
}


//返回重定向
function getRedirect(url) {
    return new Response("正在重定向到" + url, {
        status: 302,
        statusText: 'redirect',
        headers: {
            "content-type": "text/html",
            "location": url
        }
    })
}

//获取用于返回的错误信息
/**
 * @param error {String} 错误消息
 * @param type {String} 错误类型
 * @param data {Object} 数据
 * */
function getReturnError(error,type,data) {
    return new Response(JSON.stringify({
        value: 'error',
        message: error,
        type:type,
        data:data
    }), {
        status: 200,
        statusText: 'ok',
        headers: {
            "content-type": "application/json",
            "NewBingGoGoError":'true'
        }
    })
}


/**
 * 设置 url 的 X-forwarded-for 请求头
 * @param ip {String}
 * @param url {String}
 * */
async function setWebSocketHeaderXFFIP(ip,url){
    await chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds:[85654]})
    if(ip && url){
        await chrome.declarativeNetRequest.updateDynamicRules(
            {
                addRules:[{
                    "id": 85654,
                    "priority": 1,
                    "action": {
                        "type": "modifyHeaders",
                        "requestHeaders": [
                            {
                                "header": "X-forwarded-for",
                                "operation": "set",
                                "value": ip
                            }
                        ]
                    },
                    "condition": {
                        "regexFilter": url,
                        "resourceTypes": [
                            "websocket"
                        ]
                    }
                }]
            }
        );
        console.log(url+" X-forwarded-for 已设置为"+ip);
    }
}








//用于统计插件使用人数，和版本号
(async ()=>{
    let res = await fetch(chrome.runtime.getURL('manifest.json'));
    let json = await res.json();
    await chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds:[85653]})
    await chrome.declarativeNetRequest.updateDynamicRules(
        {
            addRules:[{
                "id": 85653,
                "priority": 1,
                "action": {
                    "type": "modifyHeaders",
                    "requestHeaders": [
                        {
                            "header": "referer",
                            "operation": "set",
                            "value": `https://newbinggogo.jja8.cn/plug/${json.name}/${json.version}`
                        }
                    ]
                },
                "condition": {
                    "regexFilter": "^https://hm.baidu.com/hm.gif?(.*)si=b435e427dc3b96eba3fc5df18958e020(.*)",
                    "resourceTypes": [
                        "image"
                    ]
                }
            }]
        },function(){}
    )
})()

