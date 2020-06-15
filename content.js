chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.from === 'popup') {
        switch (message.subject) {
            case SUBJECT.SUMMARY:
                sendResponse(MetaInformation.GetGeneral());
                break;
            case SUBJECT.META:
                sendResponse({
                    'facebook': MetaInformation.GetFacebook(),
                    'opengraph': MetaInformation.GetOpenGraph(),
                    'opengraph-article': MetaInformation.GetOpenGraphArticle(),
                    'others': MetaInformation.GetOthers(),
                    'parsely': MetaInformation.GetParsely(),
                    'twitter': MetaInformation.GetTwitter()
                });
                break;
            case SUBJECT.HEADING:
                sendResponse(HeadingInformation.GetHeadings());
                break;
            case SUBJECT.IMAGE:
                sendResponse(ImageInformation.GetImages());
                break;
            case SUBJECT.HYPERLINK:
                sendResponse(Hyperlinks.GetAll());
                break;
            case SUBJECT.FILE:
                sendResponse({
                    'stylesheet': FileInformation.GetStylesheetFiles(),
                    'javascript': FileInformation.GetJavaScriptFiles()
                });
                break;
        }
    }
});