// FUNCTIONS

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
    entry.setAttribute("data-last-mod-time", "");
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
        fetchUrl(entry, url);
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
        fetchUrl(entry, url);
    }
}

function makeButton(parent, label) {
    let button = document.createElement("button");
    button.setAttribute("type", "button");
    button.textContent = label;
    parent.appendChild(button);
    return button;
}

function fetchUrl(entry, url) {
    console.log(">>> Fetching URL:", url);
    fetch(url)
        .then(res => {
            let time = entry.getAttribute("data-last-mod-time")
            res.headers.forEach((value, key, parent) => {
                if (key === "last-modified") {
                    console.log(time, ">>>", value);
                    if (value !== time && time !== "") {
                        raiseAlarm();
                    }
                    entry.setAttribute("data-last-mod-time", value);
                }
            })
        })
        .catch(error => {
            console.log(error);
        });
}

function showNotification() {
    browser.notifications.create(
        "myID",
        {
            "type" : "basic",
            "title" : "MOD-ALERT",
            "message" : "A feed was updated."
        }
    )
}

function setVol(){               
    volume = Number(document.getElementById("volume").value) / 100;
    console.log(">>> Volume set to", volume);
}

function raiseAlarm() {
    clearAlarm();
    alarm = window.setInterval(makeSound, int); 
}

function clearAlarm() {
    window.clearInterval(alarm);
}

function makeSound(){
    showNotification();
                    
    let gain = acon.createGain();
    gain.connect(acon.destination);
    gain.gain.setValueCurveAtTime([0, volume, (volume / 2), 0], acon.currentTime, 1)
    
    let osc = acon.createOscillator();
    osc.connect(gain);
    osc.type = "sine";
    osc.frequency.value = 300;
    osc.start();
    osc.stop(acon.currentTime + 1);            
}

// VARIABLES
var volume, alarm;
var acon = new AudioContext();
const int = 3000; // Milliseconds between alarm chimes

const urlRegx = /^https?:\/\/.*$/;

const list = document.getElementById("list");
const inpUrl = document.getElementById("url");
const inpMin = document.getElementById("minutes");

document.getElementById("add").addEventListener("click", addEntry); 
document.getElementById("test").addEventListener("click", raiseAlarm);
document.getElementById("stop").addEventListener("click", clearAlarm);
document.getElementById("volume").addEventListener("change", setVol);

setVol();

//const audio = document.getElementById("audio");

