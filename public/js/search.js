let searchBar = document.querySelector(".searchBarInput");
let allFriends = document.querySelectorAll(".contacts > *");
let allGroups = document.querySelectorAll(".groups > *");
//merges both arrays into one
let searchResult = [];
for(let currElelment of allFriends){
    searchResult.push(currElelment);
}
for(let currElelment of allGroups){
    searchResult.push(currElelment);
}
let searchResultCurrent = searchResult;

searchBar.addEventListener("input", conLog);

function conLog() {
    let regex = new RegExp(searchBar.value.trim(), 'gi');
    for(let account of searchResultCurrent){
        if(!regex.test($(account).attr("data-username"))){
            account.style.display = "none";
        }else{
            account.style.display = "";
        }
    }        
}