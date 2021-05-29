var IsInitializedContent;

//don't initialize this content script more than once.
if (!IsInitializedContent) {
  IsInitializedContent = true;

	//listen to message from the popup script.
	//every tab of the extension send a message to this script to get the information.
	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
		switch (message.info) {
			case INFO.SUMMARY:
				sendResponse({
					'meta': Meta.GetGeneral()
				});
				break;
			case INFO.META:
				sendResponse({
					'dublincore': MetaInfo.GetDublineCoreTags(),
					'opengraph': MetaInfo.GetOpenGraphTags(),
					'others': Meta.GetOthers(),
					'parsely': Meta.GetParsely(),
					'shareaholic': MetaInfo.GetShareaholicTags(),
					'twitter': MetaInfo.GetTwitterTags()
				});
				break;
			case INFO.HEADINGS:
				sendResponse({
					'headings': HeadingModule.GetHeadings()
				});
				break;
			case INFO.IMAGES:
				sendResponse({
					'images': ImageModule.GetImages(),
					'icons': ImageModule.GetIcons()
				});
				break;
			case INFO.LINKS:
				sendResponse({
					'alternate': Meta.GetAlternateLinks(),
					'dnsprefetch': Meta.GetDnsPrefetch(),
					'links': LinkModule.GetLinks(),
					'preconnect': Meta.GetPreconnect(),
					'preload': Meta.GetPreload()
				});
				break;
			case INFO.FILES:
				sendResponse({
					'javascript': FileModule.GetJavaScriptFiles(),
					'stylesheet': FileModule.GetStylesheetFiles()
				});
				break;
		}
	});
}
