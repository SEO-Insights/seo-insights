var IsInitializedContent;

if (!IsInitializedContent) {
  IsInitializedContent = true;
  // rest of code ...
  // No return value here, so the return value is "undefined" (without quotes).
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.source === SOURCE.POPUP) {
        switch (message.subject) {
            case SUBJECT.SUMMARY:
                sendResponse(MetaInformation.GetGeneral());
                break;
            case SUBJECT.META:
                sendResponse({
                    'facebook': MetaInformation.GetFacebook(),
                    'opengraph': OpenGraph.GetBasicProperties(),
                    'opengraph-article': OpenGraph.GetArticleProperties(),
                    'opengraph-audio': OpenGraph.GetAudioProperties(),
                    'opengraph-book': OpenGraph.GetBookProperties(),
                    'opengraph-image': OpenGraph.GetImageProperties(),
                    'opengraph-profile': OpenGraph.GetProfileProperties(),
                    'opengraph-video': OpenGraph.GetVideoProperties(),
                    'others': MetaInformation.GetOthers(),
                    'parsely': MetaInformation.GetParsely(),
                    'twitter': MetaInformation.GetTwitter(),
                    'dublin-core': MetaInformation.GetDublinCore()
                });
                break;
            case SUBJECT.HEADING:
                sendResponse(HeadingModule.GetHeadings());
                break;
            case SUBJECT.IMAGE:
                sendResponse(ImageModule.GetImages());
                break;
            case SUBJECT.HYPERLINK:
                sendResponse({
                    'links': LinkModule.GetLinks(),
                    'alternate': MetaInformation.GetMetaAlternate(),
										'preload': MetaInformation.GetMetaPreload(),
										'dnsprefetch': MetaInformation.GetMetaDnsPrefetch()
                });
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
}

