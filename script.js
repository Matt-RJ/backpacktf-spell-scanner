// ==UserScript==
// @name         Backpack.tf Premium Spell Scanner
// @namespace    https://greasyfork.org/users/313414
// @version      1.02
// @description  Scans through backpack.tf premium search pages with ctrl+leftarrow and ctrl+rightarrow. The scanning stops when a spelled item appears on page. Ctrl + down arrow to force stop.
// @author       Matt-RJ
// @match        *backpack.tf/premium/search*
// ==/UserScript==

// CONFIG
var notificationSoundEnabled = true;
var notificationSoundVolume = 0.75; // Ranges from 0.0 to 1.0
var notificationSoundSource = "https://notificationsounds.com/soundfiles/99c5e07b4d5de9d18c350cdf64c5aa3d/file-sounds-1110-stairs.mp3";
var spellBlackList = ["Voices From Below", "Exorcism"]; // Any spell names here will be ignored by the scanner


// TODO: Add spellWhiteList - When this list is not empty, override spellBlackList and find only the spells listed in spellWhiteList
// TODO: Set searchState to 0 when on the first and last pages.


// -1 when searching by going backwards, 0 when staying still, 1 when searching forwards
var searchState = getCookie("searchState");

var notificationPlayer = document.createElement('audio');

setup();
run();

function setup() {
    notificationPlayer.src = notificationSoundSource;
    notificationPlayer.preload = 'auto';
    notificationPlayer.volume = notificationSoundVolume;

    if (spellsFoundOnPage() === true) {
        searchState = 0;
    }
}

function playNotificationSound() {
    if (notificationSoundEnabled === true) {
        notificationPlayer.play();
    }
}


// Cookies are used for saving and loading searchState between page loads in this script.
function saveCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return parseInt(c.substring(name.length, c.length));
        }
    }
    return 0;
}

function run() {

    if (searchState == -1) {
        // Check if first page here
        openPreviousPage();
    }
    else if (searchState == 1) {
        // Check if last page here
        openNextPage();
    }

}

function openNextPage() {
    var nextButton = document.getElementsByClassName('fa fa-angle-right')[0];
    nextButton.click();
}

function openPreviousPage() {
    var prevButton = document.getElementsByClassName('fa fa-angle-left')[0];
    prevButton.click();
}

// Checks for any spelled items on the current page
function spellsFoundOnPage() {

    var spellFound = false;

    var rows = document.evaluate(
        "/html/body/main/div/div[1]/div/div/ul/li",
        document,
        null,
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        null);

    var descriptions = document.evaluate(
        "/html/body/main/div/div[1]/div/div/div/h5",
        document,
        null,
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        null);

    for(var i = 0; i < rows.snapshotLength; i++) {
        var thisRow = rows.snapshotItem(i);

        if(thisRow.hasAttribute("data-spell_1")){
            var spell1 = thisRow.getAttribute("data-spell_1");
            if (blackListMatch(spell1) === false) {
                spellFound = true;
            }
        }
        if (thisRow.hasAttribute("data-spell_2")) {
            var spell2 = thisRow.getAttribute("data-spell_2");
            if (blackListMatch(spell2) === false){
                spellFound = true;
            }
        }
    }
    if (spellFound === true) playNotificationSound();
    return spellFound;
}

function blackListMatch(dataSpellAttribute) {
    for (var i = 0; i < spellBlackList.length; i++) {
        if (dataSpellAttribute.search(spellBlackList[i]) != -1) {
            console.log("Blacklist match found");
            return true;
        }
    }
    return false;
}

window.onkeydown = function(e) {

    if (e.ctrlKey == true) {
        if (e.keyCode == 40) { // Ctrl + down arrow
            searchState = 0;
            saveCookie("searchState",0,0.1);
            run();
        }

        if (e.keyCode == 37) { // Ctrl + left arrow
            searchState = -1;
            saveCookie("searchState",-1,0.1);
            run();
        }

        if (e.keyCode == 39) { // Ctrl + right arrow
            searchState = 1;
            saveCookie("searchState",1,0.01);
            run();
        }
    }
};
