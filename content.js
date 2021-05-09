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
					'meta': MetaInformation.GetGeneral()
				});
				break;
			case INFO.META:
				sendResponse({
					'dublincore': MetaInformation.GetDublinCore(),
					'facebook': MetaInformation.GetFacebook(),
					'opengraph': {
						'article': OpenGraph.GetArticleProperties(),
						'audio': OpenGraph.GetAudioProperties(),
						'basic': OpenGraph.GetBasicProperties(),
						'book': OpenGraph.GetBookProperties(),
						'image': OpenGraph.GetImageProperties(),
						'profile': OpenGraph.GetProfileProperties(),
						'video': OpenGraph.GetVideoProperties()
					},
					'others': MetaInformation.GetOthers(),
					'parsely': MetaInformation.GetParsely(),
					'twitter': MetaInformation.GetTwitter(),
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
					'alternate': MetaInformation.GetMetaAlternate(),
					'dnsprefetch': MetaInformation.GetMetaDnsPrefetch(),
					'links': LinkModule.GetLinks(),
					'preconnect': MetaInformation.GetMetaPreconnect(),
					'preload': MetaInformation.GetMetaPreload()
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
