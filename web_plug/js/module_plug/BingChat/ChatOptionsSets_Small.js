import pageText from "../pageText.js";

function getUuidNojian() {
    return URL.createObjectURL(new Blob()).split('/')[3].replace(/-/g, '');
}
function getUuid(){
    return URL.createObjectURL(new Blob()).split('/')[3];
}

function timeString() {
    let d = new Date();
    let year = d.getFullYear();
    let month = (d.getMonth() + 1).toString().padStart(2, "0");
    let date = d.getDate().toString().padStart(2, "0");
    let hour = d.getHours().toString().padStart(2, "0");
    let minute = d.getMinutes().toString().padStart(2, "0");
    let second = d.getSeconds().toString().padStart(2, "0");
    let offset = "+08:00"; // 你可以根据需要修改这个值
    return year + "-" + month + "-" + date + "T" + hour + ":" + minute + ":" + second + offset;
}

/**
 * @param tone {"Creative","Balanced","Precise"} 语气
 * @return {string[]} 选项
 */
function getOptionsSets(tone){
    let op = {
        //更有创造力选项
        Creative: [
            "nlu_direct_response_filter",
            "deepleo",
            "disable_emoji_spoken_text",
            "responsible_ai_policy_235",
            "enablemm",
            "h3imaginative",
            "gencontentv3",
            "cachewriteext",
            "cricketansgnd",
            "e2ecachewrite",
            "nodlcpcwrite",
            "nointernalsugg",
            "rcsprtsalwlst",
            "saharasugg",
            "dl_edge_prompt",
            "noknowimg",
            "dv3sugg"
        ],
        //Balanced 平衡模式选项
        Balanced: [
            "nlu_direct_response_filter",
            "deepleo",
            "disable_emoji_spoken_text",
            "responsible_ai_policy_235",
            "enablemm",
            "galileo",
            "cachewriteext",
            "cricketansgnd",
            "e2ecachewrite",
            "nodlcpcwrite",
            "nointernalsugg",
            "rcsprtsalwlst",
            "saharasugg",
            "dl_edge_prompt",
            "noknowimg",
            "dv3sugg"
        ],
        //精准选项
        Precise: [
            "nlu_direct_response_filter",
            "deepleo",
            "disable_emoji_spoken_text",
            "responsible_ai_policy_235",
            "enablemm",
            "h3precise",
            "cachewriteext",
            "cricketansgnd",
            "e2ecachewrite",
            "nodlcpcwrite",
            "nointernalsugg",
            "rcsprtsalwlst",
            "saharasugg",
            "dl_edge_prompt",
            "noknowimg",
            "dv3sugg"
        ]
    };
    let optionsSets = op[tone];
    if(!optionsSets){
        throw new Error("不存在的ChatType:"+tone);
    }
    return optionsSets;
}
/**
 * @param optionsSets {String[]} 聊天选项 不同的聊天类型有不同的选项
 * @param isStartOfSession {boolean} 是否是聊天的开始
 * @param timestamp {String} 2023-05-14T09:17:16+08:00 聊天开始的时间
 * @param text {String} 文本，聊天文本
 * @param conversationSignature {String} 对话签名
 * @param participant {String} 对话用户
 * @param conversationId {String} 对话id
 * @param invocationId {String} 调用id 应该从1开始每次发送+1
 * @param description {String} 页面中的文本内容
 * @param sourceName {String} 页面标题
 * @param sourceUrl {String} 页面url
 * */
function getObj(optionsSets,
                isStartOfSession,
                timestamp,
                text,
                conversationSignature,
                participant,
                conversationId,
                invocationId,
                description,
                sourceName,
                sourceUrl
){
    let requestId = getUuid();
    return {
        "arguments": [
            {
                "source": "cib",
                "optionsSets": optionsSets,
                "allowedMessageTypes": [
                    "ActionRequest",
                    "Chat",
                    "Context",
                    "InternalSearchQuery",
                    "InternalSearchResult",
                    "Disengaged",
                    "InternalLoaderMessage",
                    "RenderCardRequest",
                    "AdsQuery",
                    "SemanticSerp",
                    "GenerateContentQuery",
                    "SearchQuery"
                ],
                "sliceIds": [
                    "406sportgnds0",
                    "427startpms0",
                    "427vserps0",
                    "505iccric",
                    "505scsv5",
                    "507vaop",
                    "5082tsports",
                    "508jbcars0",
                    "512bicp1",
                    "adssqovr",
                    "allnopvt",
                    "creatorv2t",
                    "disablechatsupp",
                    "encjsreftf",
                    "forallv2",
                    "mlchat7",
                    "mlchatbase",
                    "sacf",
                    "ssoverlap0",
                    "sswebtop1",
                    "sydconfigoptc",
                    "tempcacheread",
                    "temptacache",
                    "wrapnoins",
                    "scprompt2",
                    "ton"
                ],
                "verbosity": "verbose",
                "traceId": getUuidNojian(),
                "isStartOfSession": isStartOfSession,
                "message": {
                    "locale": "zh-CN",
                    "market": "zh-CN",
                    "region": "US",
                    "location": "lat:47.639557;long:-122.128159;re=1000m;",
                    "locationHints": [
                        {
                            "country": "United States",
                            "state": "Washington",
                            "city": "Index",
                            "zipcode": "98256",
                            "timezoneoffset": -8,
                            "dma": 819,
                            "countryConfidence": 9,
                            "Center": {
                                "Latitude": 47.8201,
                                "Longitude": -121.5543
                            },
                            "RegionType": 2,
                            "SourceType": 1
                        }
                    ],
                    "timestamp": timestamp,
                    "author": "user",
                    "inputMethod": "Keyboard",
                    "text": text,
                    "messageType": "Chat"
                },
                "conversationSignature": conversationSignature,
                "participant": {
                    "id": participant
                },
                "conversationId": conversationId,
                "previousMessages": isStartOfSession?[
                    {
                        "author": "user",
                        "description": description,
                        "contextType": "WebPage",
                        "messageType": "Context",
                        "sourceName": sourceName,
                        "sourceUrl": sourceUrl
                    }
                ]:undefined
            }
        ],
        "invocationId": invocationId,
        "target": "chat",
        "type": 4
    }
}

/**
 * 处理聊天选项的类
 * */
export default class ChatOptionsSets{
    /**
     * @param sendMessageManager {SendMessageManager}
     * @param chat {String} 要发送的消息
     * */
    async getSendJson(sendMessageManager,chat){
        if(!sendMessageManager.startTime){
            sendMessageManager.startTime = timeString();
        }

        const get = () => new Promise((resolve) => pageText.update(resolve))
        //等待获取到页面内容
        await get();
        let pagein = pageText.get();

        return getObj(
            getOptionsSets(sendMessageManager.optionsSets),
            sendMessageManager.invocationId<=1,
            sendMessageManager.startTime,
            chat,
            sendMessageManager.conversationSignature,
            sendMessageManager.clientId,
            sendMessageManager.conversationId,
            sendMessageManager.invocationId.toString(),
            pagein.description,
            pagein.sourceName,
            pagein.sourceUrl)
    }
}