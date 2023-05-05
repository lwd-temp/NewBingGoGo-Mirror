//将聊天窗口插入到当前页面
async function insertRightChatToThisTab(){
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
        pagePath:'/web_plug/NewBingGoGo_Small.html',
        name:'NewBingGoGo 聊天'
    });
}