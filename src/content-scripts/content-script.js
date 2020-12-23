console.log("test")
var checkExist = setInterval(function () {
    if (document.getElementsByClassName('sorting_1').length) {
        console.log("Exists!");
        loadAddClassButton();
        clearInterval(checkExist);
    }
}, 100)

async function addClassToScheduler(row) {
    console.log(row)
    let name = row.childNodes[0].childNodes[0].innerText;
    let days = row.childNodes[7].childNodes[0].childNodes[0].innerText
    let time = row.childNodes[7].childNodes[0].childNodes[1].innerText
    let prof = row.childNodes[8].childNodes[0].innerText
    console.log(days)
    console.log(name)
    console.log(time)
    console.log(prof)
let classes = await browser.storage.local.get(['classes'])
    if(!(classes.classes)){
        console.log("settgings")
        browser.storage.local.set({
            classes: [
                {
                    days,
                    name,
                    time,
                    prof
                }
            ]
        })
    }else{
        let classes = await browser.storage.local.get(['classes']);
        console.log(classes.classes)
        classes.classes.push({
            days,
            name,
            time,
            prof
        })
        browser.storage.local.set({
            classes: classes.classes
        })
    }



    console.log(await browser.storage.local.get(['classes']))
}
async function loadAddClassButton() {
    let addedClasses = await browser.storage.local.get(['classes'])
    console.log("loading buttons")
    if(!addedClasses.classes){
        addedClasses.classes = [];
    }
    let headings = document.getElementsByClassName('sorting_1');
    console.log(headings)
    for (let item of headings) {
        let addButton = document.createElement("a");
        addButton.className += "sfsu-scheduler_add_class"
        addButton.innerText = "Add To Scheduler"
        console.log(item);

        if(addedClasses.classes.filter(data => data.name === item.parentNode.childNodes[0].childNodes[0].innerText).length === 0){
            item.append(addButton)
            addButton.addEventListener("click", () => {
                addClassToScheduler(item.parentNode)
                item.childNodes[1].remove()
                addButton.className = "sfsu-scheduler_added_class"
                addButton.innerText = "Already Added"
                item.append(addButton)
            })
        }else{
            let addButton = document.createElement("a");
            addButton.className += "sfsu-scheduler_added_class"
            addButton.innerText = "Already Added"
            item.append(addButton)
        }


    }
}
