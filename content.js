chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.source === SOURCE.POPUP) {
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
                    'twitter': MetaInformation.GetTwitter(),
                    'dublin-core': MetaInformation.GetDublinCore()
                });
                break;
            case SUBJECT.HEADING:
                sendResponse(HeadingInformation.GetHeadings());
                break;
            case SUBJECT.IMAGE:
                sendResponse(ImageModule.GetImages());
                break;
            case SUBJECT.HYPERLINK:
                var arrHyperlinks = [];

                if (top.frames.length > 0) {
                    for (frameIndex = 0; frameIndex < top.frames.length; frameIndex++) {
                        arrHyperlinks = arrHyperlinks.concat(Hyperlinks.GetAll(top.frames[frameIndex].document));
                    }
                }

                arrHyperlinks = arrHyperlinks.concat(Hyperlinks.GetAll());
                
                sendResponse(arrHyperlinks);
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