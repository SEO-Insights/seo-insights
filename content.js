chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.from === 'popup') {
        switch (message.subject) {
            case 'initialization':
                sendResponse(GetInformationMetaTags());
                break;
            case 'meta':
                var info = {
                    'opengraph': GetOpenGraphMeta(),
                    'parsely': GetParselyMeta(),
                    'twitter': GetTwitterMeta()
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