/**
 * function to handle the result of the injection of the content script.
 */
function HandleNotSupported() {
    if (chrome.runtime.lastError !== undefined) {
        $('body').addClass('not-supported');
    } else {
        $('body').removeClass('not-supported');
    }
}

//programmatically inject the content script.
chrome.tabs.executeScript({file: 'libs/jquery-3.5.1.min.js'}, HandleNotSupported);
chrome.tabs.executeScript({file: 'content.js'}, HandleNotSupported);

$(document).ready(function() {

    //init
    if ($('body').hasClass('not-supported') === false) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, tabs => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {from: 'popup', subject: 'initialization'},
                data
            );
        });

        const data = info => {
            $('span[data-seo-info="title"]').text(info.title);
        };
    }
});