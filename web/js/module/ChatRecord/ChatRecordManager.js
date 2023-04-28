/**
 * 处理聊天记录的类,
 * */
import ChatRecord from "./ChatRecord.js";

export default class ChatRecordManager {
    /**
     * 获取聊天记录列表。返回一个ChatRecord数组
     * */
    static chatRecords(){
        let records = JSON.parse(localStorage.chatRecords);
        delete records.nextIndex;
        let chatRecords = [];
        for(let theIn in records){
            chatRecords.push(ChatRecord.loadFromObj(records[theIn],theIn));
        }
        return chatRecords;
    }
    /**
     * 添加一个聊天记录
     * */
    static add(chatRecord){
        let records = JSON.parse(localStorage.chatRecords);
        if(!records.nextIndex){
            records.nextIndex = 1;
        }
        records[records.nextIndex++] = chatRecord.saveToObj();
        localStorage.chatRecords = JSON.stringify(records);
    }
    /**
     * 删除一个聊天记录
     * */
    static delete(chatRecord){
        let records = JSON.parse(localStorage.chatRecords);
        records[chatRecord.id] = undefined;
        localStorage.chatRecords = JSON.stringify(records);
    }
    /**
     * 更新一个聊天记录
     * */
    static update(chatRecord){
        if(!chatRecord.id){
            throw new Error("使用create创建的聊天记录，不可以使用update方法。");
        }
        let records = JSON.parse(localStorage.chatRecords);
        records[chatRecord.id] = chatRecord.saveToObj();
        localStorage.chatRecords = JSON.stringify(records);
    }
}
