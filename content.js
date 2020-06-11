chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.from === 'popup') {
        switch (message.subject) {
            case 'initialization':
                sendResponse(GetInformationMetaTags());
                break;
            case 'meta':
                var info = {
                    'article': MetaInformation.GetArticle(),
                    'opengraph': MetaInformation.GetOpenGraph(),
                    'parsely': MetaInformation.GetParsely(),
                    'twitter': MetaInformation.GetTwitter()
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