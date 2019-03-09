const urlRegx = /^https?:\/\/.*$/;
const list = document.getElementById("list");
const inpUrl = document.getElementById("url");
const inpMin = document.getElementById("minutes");
var time = "";

function addEntry(event) {
    let url = inpUrl.value;
    let mins = inpMin.value;
    mins = parseInt(mins, 10);
    
    // Sanity checking
    if (Number.isNaN(mins) === true) {
        alert("Minutes must be a number.");
        return;
    } else if (mins < 5 || mins > 1440) {
        alert("Minutes must be between 5 and 1440.");
        return;
    } else if (urlRegx.test(url) === false) {
        alert("Not a valid URL.");
        return;
    }

    // Make entry
    let entry = document.createElement("div");
    entry.innerHTML = "Check <span class='list-url'>" + url + "</span> <br />" + 
    "every <span class='list-mins'>" + mins + "</span> minutes. " + 
    "Last checked <span class='list-count'>0</span> minutes ago. ";
    entry.setAttribute("data-url", url);
    entry.setAttribute("data-mins", mins);
    list.appendChild(entry);
    let count = entry.getElementsByClassName("list-count")[0];
    
    // Make timer
    let timer = window.setInterval(makeTimer, 60000, entry, count, mins, url);

    //Make buttons
    let edit = makeButton(entry, "Edit");
    edit.addEventListener("click", event => {
        inpUrl.value = url;
        inpMin.value = mins;
        removeEntry(entry, timer);
    })

    let del = makeButton(entry, "Remove");
    del.addEventListener("click", event => {
        removeEntry(entry, timer);
    })

    let check = makeButton(entry, "Check Now");
    check.addEventListener("click", event => {
        count.textContent = "0";  
        fetchUrl(url);
    })
}

function removeEntry(entry, timer) {
    entry.parentElement.removeChild(entry);
    window.clearInterval(timer);
}

function makeTimer(entry, count, mins, url) {
    console.log(">>> Timer Fired", mins, url, entry);    
    let countVal = parseInt(count.textContent);
    if (countVal < mins) {
        count.textContent = countVal + 1;
    } else {
        count.textContent = "0";
        fetchUrl(url);
    }
}

function makeButton(parent, label) {
    let button = document.createElement("button");
    button.setAttribute("type", "button");
    button.textContent = label;
    parent.appendChild(button);
    return button;
}

function fetchUrl(url) {
    console.log(">>> Fetching URL:", url);
    fetch(url)
        .then(res => {
            res.headers.forEach((value, key, parent) => {
                if (key === "last-modified") {
                    console.log(time, ">>>", value);
                    if (value !== time && time !== "") {
                        raiseAlarm();
                    }
                    time = value;
                }
            })
        })
        .catch(error => {
            console.log(error);
        });
}

function raiseAlarm() {
    console.log(">>> SOUND THE ALARM!");
    browser.notifications.create(
        "myID",
        {
            "type" : "basic",
            "title" : "UPDATE!",
            "message" : "A feed was updated."
        }
    )
    audio.play();
}

document.getElementById("add").addEventListener("click", addEntry); 

document.getElementById("test").addEventListener("click", raiseAlarm);

const audio = document.getElementById("audio");

