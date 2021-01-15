//let leftSidebarStyle = window.getComputedStyle(leftSidebar);
const leftSidebar = document.querySelectorAll("aside")[0];
const rightSidebar = document.querySelectorAll("aside")[1];

const leftArrowDiv = document.querySelectorAll(".arrow")[0];
const leftArrowImg = document.querySelectorAll(".arrow-img")[0];

const rightArrowDiv = document.querySelectorAll(".arrow")[1];
const rightArrowImg = document.querySelectorAll(".arrow-img")[1];

let friendName = document.querySelectorAll(".friendName");
let friend2Name = document.querySelectorAll(".friend2Name");

let isLeftSidebarClosed = false;
let isRightSidebarClosed = false;

leftArrowDiv.addEventListener("click", () => {
    if(isLeftSidebarClosed){
        leftSidebar.style.gridColumn = "1/3";
        leftSidebar.classList.add("open-Lsidebar");
        leftArrowImg.classList.add("rotateArrowOpen");
        leftArrowDiv.classList.add("arrowOpacityDecrease");
        addOrRemoveStyleClassArray(friendName, "add", "friendNameBigAnimation");
        setTimeout(() => {
            leftSidebar.classList.remove("open-Lsidebar");
            leftArrowImg.classList.remove("rotateArrowOpen");
            leftArrowImg.style.transform = "rotate(180deg)";
            leftArrowDiv.classList.remove("arrowOpacityDecrease");
            addOrRemoveStyleClassArray(friendName, "remove", "friendNameBigAnimation", "14.53px");
            isLeftSidebarClosed = false;
        }, 500);
    }else{
        leftSidebar.classList.add("close-Lsidebar");
        leftArrowImg.classList.add("rotateArrowClose");
        leftArrowDiv.classList.add("arrowOpacityDecrease");
        addOrRemoveStyleClassArray(friendName, "add", "friendNameSmollAnimation");
        setTimeout(() => {
            leftSidebar.style.gridColumn = "1/2";
            leftSidebar.classList.remove("close-Lsidebar");
            leftArrowImg.classList.remove("rotateArrowClose");
            leftArrowImg.style.transform = "rotate(360deg)";
            leftArrowDiv.classList.remove("arrowOpacityDecrease");
            addOrRemoveStyleClassArray(friendName, "remove", "friendNameSmollAnimation", "0px");
            isLeftSidebarClosed = true;
        }, 500);
    }
});

rightArrowDiv.addEventListener("click", () => {
    if(isRightSidebarClosed){
        rightSidebar.style.gridColumn = "4/6";
        rightSidebar.classList.add("open-Rsidebar");
        rightArrowImg.classList.add("rotateArrowClose");
        rightArrowDiv.classList.add("arrowOpacityDecrease");
        addOrRemoveStyleClassArray(friend2Name, "add", "friendNameBigAnimation");
        setTimeout(() => {
            rightSidebar.classList.remove("open-Rsidebar");
            rightArrowImg.classList.remove("rotateArrowClose");
            rightArrowImg.style.transform = "rotate(360deg)";
            rightArrowDiv.classList.remove("arrowOpacityDecrease");
            addOrRemoveStyleClassArray(friend2Name, "remove", "friendNameBigAnimation", "14.53px");
            isRightSidebarClosed = false;
        }, 500);
    }else{
        rightSidebar.classList.add("close-Rsidebar");
        rightArrowImg.classList.add("rotateArrowOpen");
        rightArrowDiv.classList.add("arrowOpacityDecrease");
        addOrRemoveStyleClassArray(friend2Name, "add", "friendNameSmollAnimation");
        setTimeout(() => {
            rightSidebar.style.gridColumn = "5/6";
            rightSidebar.classList.remove("close-Rsidebar");
            rightArrowImg.classList.remove("rotateArrowOpen");
            rightArrowImg.style.transform = "rotate(180deg)";
            rightArrowDiv.classList.remove("arrowOpacityDecrease");
            addOrRemoveStyleClassArray(friend2Name, "remove", "friendNameSmollAnimation", "0px");
            isRightSidebarClosed = true;
        }, 500);
    }
});

function addOrRemoveStyleClassArray(array, addOrRemove, styleClass, fontSize) {
    if(addOrRemove == "add"){
        for(const node of array){
            node.classList.add(styleClass);
        }
    }else{
        for(const node of array){
            node.classList.remove(styleClass);
            node.style.fontSize = fontSize;
        }
    }
}

/*for(let i = 0; i < 100000; i++){
    console.log(i);
    leftSidebar.style.marginRight = (Number(leftSidebar.style.marginRight.replace(/\D+$/g, "")) + i) + "px";
}*/
// for(let i = 0; i < 10; i++){
//     setTimeout(helo, 3000);
// }
// function helo(){
//     leftSidebar.style.marginRight = (Number(leftSidebar.style.marginRight.replace(/\D+$/g, "")) + 5) + "px";
//     console.log(`leftSidebar.style.marginRight = ${leftSidebar.style.marginRight}`);
// }


