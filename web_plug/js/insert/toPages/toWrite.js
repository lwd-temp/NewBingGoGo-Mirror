//将聊天窗口插入到当前页面
async function insertWriteToThisTab(){
    let tab = await chrome.tabs.query({
        active:true,
        currentWindow:true
    });
    if(!tab[0]){
        return;
    }
    tab = tab[0];
    chrome.tabs.sendMessage(tab.id,{
        type:'openWindow',
        pagePath:'/web_plug/Write_Small.html',
        name:'NewBingGoGo 创作'
    });
}