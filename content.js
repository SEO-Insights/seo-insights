chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.from === 'popup') {
        switch (message.subject) {
            case 'initialization':
                var info = {
                    'title': $('title').text()
                }
                sendResponse(info);
                break;
        }
    }
});