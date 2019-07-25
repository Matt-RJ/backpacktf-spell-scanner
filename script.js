// ==UserScript==
// @name         Backpack.tf Premium Spell Scanner
// @namespace    https://greasyfork.org/users/313414
// @version      1.06
// @description  Scans through backpack.tf premium search pages with ctrl+leftarrow and ctrl+rightarrow. The scanning stops when a spelled item appears on page. Ctrl + down arrow to force stop.
// @author       Matt-RJ
// @match        *backpack.tf/premium/search*
// ==/UserScript==

// CONFIG
var notificationSoundEnabled = true;
var notificationSoundVolume = 0.75; // Ranges from 0.0 to 1.0
var notificationSoundSource = "https://notificationsounds.com/soundfiles/99c5e07b4d5de9d18c350cdf64c5aa3d/file-sounds-1110-stairs.mp3";
var endNotificationSoundSource = "https://notificationsounds.com/soundfiles/0fcbc61acd0479dc77e3cccc0f5ffca7/file-sounds-1078-case-closed.mp3";

// Any spell names here will be ignored by the scanner
var spellBlackList = ["Voices From Below","Exorcism"];

// If any spells are named here, they will be the only ones to appear. (Overrides spellBlackList)
var spellWhiteList = [];

/*
How long to pause for before loading another page during a search (in ms).
WARNING: Low values may cause too many requests to be sent to backpack.tf over a period of time. Use lower values at your own risk.
*/
var searchDelay = 750;



var searchState = getCookie("searchState"); // -1 when searching by going backwards, 0 when staying still, 1 when searching forwards
var notificationPlayer = document.createElement('audio'); // Used for notification sounds

setup();
run();

function setup() {
    notificationPlayer.src = notificationSoundSource;
    notificationPlayer.preload = 'auto';
    notificationPlayer.volume = notificationSoundVolume;

    // Stops scanning if spells are found
    if (spellsFoundOnPage()) {
        searchState = 0;
    }

    // Stops scanning if on first or last page
    if (onFirstOrLastPage()) {
        playNotificationSound(endNotificationSoundSource);
        searchState = 0;
    }
}

function run() {
    if (searchState == -1) {
        setTimeout(function() {
            openPreviousPage();
        }, searchDelay);
    }
    else if (searchState == 1) {
        setTimeout(function() {
            openNextPage();
        }, searchDelay);
    }
    else if (searchState === 0) {
        saveCookie("searchState",0,0.15);
    }
}

// Determines if the first or last page is loaded.
function onFirstOrLastPage() {
    return (document.getElementsByClassName('fa fa-angle-left')[0].parentElement.parentElement.className == "disabled" ||
            document.getElementsByClassName('fa fa-angle-right')[0].parentElement.parentElement.className == "disabled");
}

function playNotificationSound(src) {
    notificationPlayer.src = src;
    if (notificationSoundEnabled) notificationPlayer.play();
}


// Cookies are used for saving and loading searchState between page loads in this script.

// Saves a cookie under backpack.tf
function saveCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// Loads a cookie from under backpack.tf
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

function openNextPage() {
    var nextButton = document.getElementsByClassName('fa fa-angle-right')[0];
    nextButton.click();
}

function openPreviousPage() {
    var prevButton = document.getElementsByClassName('fa fa-angle-left')[0];
    prevButton.click();
}

// Checks for any non-blacklisted spelled items on the current page.
function spellsFoundOnPage() {

    var spellFound = false;

    var rows = document.evaluate(
        "/html/body/main/div/div[1]/div/div/ul/li",
        document,
        null,
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        null);

    for(var i = 0; i < rows.snapshotLength; i++) {
        var thisRow = rows.snapshotItem(i);

        // Checks for first spell
        if(thisRow.hasAttribute("data-spell_1")){
            var spell1 = thisRow.getAttribute("data-spell_1");

            // Checks for whitelist match - Only applies if whitelist isn't empty
            if (spellWhiteList.length > 0) {
                if (whiteListMatch(spell1) === true) {
                    spellFound = true;
                }
            }
            else if (blackListMatch(spell1) === false) {
                spellFound = true;
            }
        }

        // Checks for second spell
        if (thisRow.hasAttribute("data-spell_2")) {
            var spell2 = thisRow.getAttribute("data-spell_2");

            // Checks for whitelist match - Only applies if whitelist isn't empty
            if (spellWhiteList.length > 0) {
                if (whiteListMatch(spell2) === true) {
                    spellFound = true;
                }
            }
            else if (blackListMatch(spell2) === false){
                spellFound = true;
            }
        }
    }
    if (spellFound) playNotificationSound(notificationSoundSource);
    return spellFound;
}

// Determines if dataSpellAttribute contains a blacklisted spell from spellBlackList
function blackListMatch(dataSpellAttribute) {
    for (var i = 0; i < spellBlackList.length; i++) {
        if (dataSpellAttribute.search(spellBlackList[i]) != -1) {
            console.log("Blacklist match found");
            return true;
        }
    }
    return false;
}

// Determines if dataSpellAttribute contains a whitelisted spell from spellWhiteList
function whiteListMatch(dataSpellAttribute) {
    for (var i = 0; i < spellWhiteList.length; i++) {
        if (dataSpellAttribute.search(spellWhiteList[i]) != -1) {
            console.log("Whitelist match found");
            return true;
        }
    }
    return false;
}

// Handles keyboard inputs
window.onkeydown = function(e) {

    if (e.ctrlKey) {
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
