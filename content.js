chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.from === 'popup') {
        switch (message.subject) {
            case 'initialization':
                var info = {
                    'head': GetHeadInformation()
                };

                sendResponse(info);
                break;
            case 'headings':
                var info = {
                    'heading': GetHeadings()
                };

                sendResponse(info);
                break;
            case 'images':
                var info = {
                    'images': GetImages()
                };

                sendResponse(info);
                break;
            case 'links':
                var info = {
                    'links': GetHyperlinks()
                };

                sendResponse(info);
                break;
        }
    }
});