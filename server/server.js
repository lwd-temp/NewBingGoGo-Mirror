self.addEventListener("fetch",function(event) {
    if (event.request.url.startsWith(chrome.runtime.getURL(''))){
        event.respondWith(handleRequest(event.request))
    }
   // console.log(event);
});

async function handleRequest(request){

    let url = urlToOder(request.url);
    if(url==='/web/resource/CueWord.json'){
        return goUrl(request,'https://gitee.com/jja8/NewBingGoGo/raw/master/cueWord.json');
    }
    if (url.startsWith('/pages/')||url.startsWith('/web/')||url==='/favicon.ico') { //web请求
        return goUrl(request,chrome.runtime.getURL(url));
    }
    //用于测试
    if (url.startsWith('/test/')) {
        let a = url.replace('/test/','');
        return goUrl(request, a);
    }


    if(url==='/sydney/ChatHubUrl'){ //请求url
        if(await getChatHubWithMagic()){
            try {
                let mUrl = uRLTrue(await getMagicUrl()) ;
                return new Response(`${mUrl.replace('http','ws')}/sydney/ChatHub`);
            }catch (error){
                console.warn(error);
                return getReturnError(error.message);
            }
        }else {
            return new Response(`wss://sydney.bing.com/sydney/ChatHub`);
        }
    }

    try {
        if (url==='/turing/conversation/create') { //创建聊天
            let re = goUrl(request, `${uRLTrue(await getMagicUrl())}/turing/conversation/create`);
            if((await re).status===404){
                return getReturnError("魔法链接服务器在NewBing不支持的地区，换一个魔法链接吧！");
            }
            return re;
        }

        if (url.startsWith('/msrewards/api/v1/enroll?')) { //加入候补
            let a = request.url.split("?");
            return goUrl(request, `${uRLTrue(await getMagicUrl())}/msrewards/api/v1/enroll?${a[1]}`);
        }

        if (url.startsWith('/images/create?')) { //AI画图
            let a = request.url.split("?");
            return goUrl(request, `${uRLTrue(await getMagicUrl())}/images/create?${a[1]}`, {
                "sec-fetch-site": "same-origin",
                "referer": "https://www.bing.com/search?q=bingAI"
            });
        }
        if (url.startsWith('/images/create/async/results')) { //请求AI画图图片
            let a = url.replace('/images/create/async/results', `${uRLTrue(await getMagicUrl())}/images/create/async/results`);
            return goUrl(request, a, {
                "sec-fetch-site": "same-origin",
                "referer": "https://www.bing.com/images/create?partner=sydney&showselective=1&sude=1&kseed=7000"
            });
        }
    }catch (error){
        console.warn(error);
        return getReturnError(error.message);
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
 * 去掉协议和主机头
 * */
function urlToOder(url){
    let w = url.split('/',3);
    let left = '';
    w.forEach((e)=>{
        left = left+'/'+e;
    });
    left = left.substring(1);
    return url.replace(left,'');
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
    //添加自己的cookies

    let cookieID =0;
    fp.headers["cookie"] = reqHeaders.get('cookie');

    //添加X-forwarded-for
    // fp.headers['X-forwarded-for'] = `${getRndInteger(3,5)}.${getRndInteger(1,255)}.${getRndInteger(1,255)}.${getRndInteger(1,255)}`;

    let res = await fetch(url, fp);
    let headers = new Headers(res.headers);
    headers.set("cookieID",cookieID);
    return new Response(res.body,{
        status:res.status,
        statusText:res.statusText,
        headers:headers
    });
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