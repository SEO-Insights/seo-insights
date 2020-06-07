console.log('popup-script running');

chrome.tabs.executeScript({
    file: 'content.js'
}, _=> {
    var error = chrome.runtime.lastError;

    if(error !== undefined) {
        console.log('not valid tab');
    } else {
        $('div#loading').hide();
    }
});

$(document).ready(function() {

    $('div#event1').on('click', function() {
        console.log('event1 clicked');

        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, tabs => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {from: 'popup', subject: 'event1'},
                data
            );
        });

        const data = info => {
            console.log(info);
        }
    });

    $('div#event2').on('click', function() {
        console.log('event2 clicked');

        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, tabs => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {from: 'popup', subject: 'event2'},
                data
            );
        });

        const data = info => {
            console.log(info);
        }
    });
});