chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.from === 'popup') {
        switch (message.subject) {
            case 'event1':
                sendResponse('Event 1');
                break;
            case 'event2':
                sendResponse('Event 2');
                break;
        }
    }
});