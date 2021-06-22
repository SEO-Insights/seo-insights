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
					'meta': SEOInsights.Head.GetCommonTags(),
					'ga': {
						'identifiers': SEOInsights.Head.GetGoogleAnalytics(),
						'files': SEOInsights.File.GetGoogleAnalyticsFiles()
					},
					'gtm': {
						'identifiers': SEOInsights.Head.GetGoogleTagManager(),
						'files': SEOInsights.File.GetGoogleTagManagerFiles()
					}
				});
				break;
			case INFO.META:
				sendResponse({
					'dublincore': MetaInfo.GetDublineCoreTags(),
					'opengraph': MetaInfo.GetOpenGraphTags(),
					'others': SEOInsights.Head.GetOthers(),
					'parsely': MetaInfo.GetParselyTags(),
					'shareaholic': MetaInfo.GetShareaholicTags(),
					'twitter': MetaInfo.GetTwitterTags()
				});
				break;
			case INFO.HEADINGS:
				sendResponse({
					'headings': SEOInsights.Heading.GetHeadings()
				});
				break;
			case INFO.IMAGES:
				sendResponse({
					'images': SEOInsights.Image.GetImages(),
					'icons': SEOInsights.Image.GetIcons()
				});
				break;
			case INFO.LINKS:
				sendResponse({
					'alternate': SEOInsights.Head.GetAlternateLinks(),
					'dnsprefetch': SEOInsights.Head.GetDnsPrefetch(),
					'links': SEOInsights.Link.GetLinks(),
					'preconnect': SEOInsights.Head.GetPreconnect(),
					'preload': SEOInsights.Head.GetPreload()
				});
				break;
			case INFO.FILES:
				sendResponse({
					'javascript': SEOInsights.File.GetJavaScriptFiles(),
					'stylesheet': SEOInsights.File.GetStylesheetFiles(),
					'googleanalytics': SEOInsights.File.GetGoogleAnalyticsFiles(),
					'googletagmanager': SEOInsights.File.GetGoogleTagManagerFiles()
				});
				break;
		}
	});
}
