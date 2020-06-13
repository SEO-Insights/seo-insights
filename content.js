chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.from === 'popup') {
        switch (message.subject) {
            case SUBJECT.SUMMARY:
                sendResponse(MetaInformation.GetGeneral());
                break;
            case SUBJECT.META:
                var info = {
                    'article': MetaInformation.GetArticle(),
                    'opengraph': MetaInformation.GetOpenGraph(),
                    'parsely': MetaInformation.GetParsely(),
                    'twitter': MetaInformation.GetTwitter(),
                    'others': MetaInformation.GetOthers()
                };

                sendResponse(info);
                break;
            case SUBJECT.HEADING:
                var info = {
                    'heading': GetHeadings()
                };

                sendResponse(info);
                break;
            case SUBJECT.IMAGE:
                var info = {
                    'images': GetImages()
                };

                sendResponse(info);
                break;
            case SUBJECT.HYPERLINK:
                sendResponse(Hyperlinks.GetAll());
                break;
            case SUBJECT.FILE:
                var info = {
                    'stylesheet': FileInformation.GetStylesheetFiles(),
                    'javascript': FileInformation.GetJavaScriptFiles()
                };

                sendResponse(info);
                break;
        }
    }
});