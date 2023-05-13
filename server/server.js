self.addEventListener("fetch",function(event) {
    if (event.request.url.startsWith(chrome.runtime.getURL(''))){
        event.respondWith(handleRequest(event.request))
        return;
    }
   // console.log(event);
});

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
            "sec-fetch-site": "same-origin",
            "referer": "https://www.bing.com/search?q=bingAI"
        });
    }

    try {//这里面都是需要魔法链接的
        if(url.pathname==='/sydney/ChatHubUrl'){ //请求url
            if(await getChatHubWithMagic()){
                let mUrl = uRLTrue(await getMagicUrl()) ;
                await copyCookies(mUrl)
                return new Response(`${mUrl.replace('http','ws')}/sydney/ChatHub`);
            }else {
                return new Response(`wss://sydney.bing.com/sydney/ChatHub`);
            }
        }

        if (url.pathname==='/turing/conversation/create') { //创建聊天
            let mUrl = uRLTrue(await getMagicUrl()) ;
            await copyCookies(mUrl)
            return await goUrl(request, `${mUrl}/turing/conversation/create`);
        }

        if (url.pathname==='/msrewards/api/v1/enroll') { //加入候补
            let mUrl = uRLTrue(await getMagicUrl()) ;
            await copyCookies(mUrl)
            return await goUrl(request, `${mUrl}/msrewards/api/v1/enroll`+url.search);
        }

        if (url.pathname==='/images/create') { //AI画图
            let mUrl = uRLTrue(await getMagicUrl()) ;
            await copyCookies(mUrl)
            return await goUrl(request, `${mUrl}/images/create`+url.search);
        }

        if (url.pathname.startsWith('/images/create/async/results')) { //请求AI画图图片
            let mUrl = uRLTrue(await getMagicUrl()) ;
            await copyCookies(mUrl)
            let a = url.pathname.replace('/images/create/async/results', `${mUrl}/images/create/async/results`)+url.search;
            return await goUrl(request, a, {
                "sec-fetch-site": "same-origin",
                "referer": "https://www.bing.com/images/create?partner=sydney&showselective=1&sude=1&kseed=7000"
            });
        }
    }catch (error){
        console.warn(error);
        return getReturnError("发生错误，请尝试更换魔法链接。"+error.message);
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
 * */
async function goUrl(request, url, addHeaders) {
    //构建 fetch 参数
    let fp = {
        method: request.method,
        headers: {}
    }
    //保留头部信息
    let reqHeaders = new Headers(request.headers);
    let dropHeaders = ["user-agent", "accept", "accept-language"];
    let he = reqHeaders.entries();
    for (let h of he) {
        let key = h[0],
            value = h[1];
        if (dropHeaders.includes(key)) {
            fp.headers[key] = value;
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
function getReturnError(error) {
    return new Response(JSON.stringify({
        value: 'error',
        message: error
    }), {
        status: 200,
        statusText: 'ok',
        headers: {
            "content-type": "application/json",
            "NewBingGoGoError":'true'
        }
    })
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

