var IsInitializedContent;

if (!IsInitializedContent) {
  IsInitializedContent = true;
  // rest of code ...
  // No return value here, so the return value is "undefined" (without quotes).
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.source === SOURCE.POPUP) {
        switch (message.subject) {
            case SUBJECT.SUMMARY:
                sendResponse({
									'meta': MetaInformation.GetGeneral()
								});
                break;
            case SUBJECT.META:
                sendResponse({
                    'facebook': MetaInformation.GetFacebook(),
                    'opengraph': {
											'basic': OpenGraph.GetBasicProperties(),
											'article': OpenGraph.GetArticleProperties(),
											'audio': OpenGraph.GetAudioProperties(),
											'book': OpenGraph.GetBookProperties(),
											'image': OpenGraph.GetImageProperties(),
											'profile': OpenGraph.GetProfileProperties(),
											'video': OpenGraph.GetVideoProperties()
										},
                    'others': MetaInformation.GetOthers(),
                    'parsely': MetaInformation.GetParsely(),
                    'twitter': MetaInformation.GetTwitter(),
                    'dublincore': MetaInformation.GetDublinCore()
                });
                break;
            case SUBJECT.HEADING:
                sendResponse({
									'headings': HeadingModule.GetHeadings()
								});
                break;
            case SUBJECT.IMAGE:
                sendResponse({
									'images': ImageModule.GetImages(),
									'icons': ImageModule.GetIcons()
								});
                break;
            case SUBJECT.HYPERLINK:
                sendResponse({
                    'links': LinkModule.GetLinks(),
                    'alternate': MetaInformation.GetMetaAlternate(),
										'preload': MetaInformation.GetMetaPreload(),
										'dnsprefetch': MetaInformation.GetMetaDnsPrefetch(),
										'preconnect': MetaInformation.GetMetaPreconnect()
                });
                break;
            case SUBJECT.FILE:
                sendResponse({
                    'stylesheet': FileModule.GetStylesheetFiles(),
                    'javascript': FileModule.GetJavaScriptFiles()
                });
                break;
        }
    }
});
}

