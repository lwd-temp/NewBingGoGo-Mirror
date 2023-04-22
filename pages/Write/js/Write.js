let toneSelectbuttns = document.querySelectorAll("#toneSelect>div");
let formatSelecctbuttns = document.querySelectorAll("#formatSelecct>div");
let lengthSelectbuttns = document.querySelectorAll("#lengthSelect>div");


/*控制按钮组选择，当选中新的按钮时回调函数*/
function selectButtonFunRetrun(buttonGroup, returnFun) {
    for (let i = 0; i < buttonGroup.length; i++) {
        let the = buttonGroup[i];
        the.onclick = () => {
            for (let j = 0; j < buttonGroup.length; j++) {
                buttonGroup[j].classList.remove("selected");
            }
            the.classList.add("selected");
            returnFun(the);
        };
    }
}


window.addEventListener('load', () => {
    // 将按钮组添加
    tone = toneSelectbuttns[0].dataset.value;
    toneSelectbuttns[0].classList.add('selected');
    selectButtonFunRetrun(toneSelectbuttns, (re) => {
        tone = re.dataset.value;
    });
    format = formatSelecctbuttns[0].dataset.value;
    formatSelecctbuttns[0].classList.add('selected');
    selectButtonFunRetrun(formatSelecctbuttns, (re) => {
        format = re.dataset.value;
    });
    length = lengthSelectbuttns[0].dataset.value;
    lengthSelectbuttns[0].classList.add('selected');
    selectButtonFunRetrun(lengthSelectbuttns, (re) => {
        length = re.dataset.value;
    });
});


//重新解析建议消息
function porserSuggestedResponses(suggestedResponses) {

}