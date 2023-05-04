let inPageText = {
    description:'',
    sourceUrl:'',
    sourceName:''
};
let reFuns = [];

//监听消息
window.addEventListener('message',(event)=>{
    let message = event.data;
    if(message.type == 'reBodyText'){
        inPageText.description = message.description;
        inPageText.sourceUrl = message.sourceUrl;
        inPageText.sourceName = message.sourceName;
        console.log(inPageText);
        let rof = reFuns;
        reFuns = [];
        rof.forEach((v)=>{v();});
    }
});

export default class pageText{
    /**
     * @param fun 当更新成功回调函数
     */
    static update(fun){
        parent.window.postMessage({
            type:'getBodyText'
        },'*');
        reFuns[reFuns.length] = fun;
    }
    static get(){
        return inPageText;
    }
}

