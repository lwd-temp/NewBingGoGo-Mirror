function URLTrue(magicUrl) {
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
export default URLTrue;