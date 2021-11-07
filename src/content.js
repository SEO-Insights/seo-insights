var IsInitializedContent;

// don't initialize this content script more than once.
if (!IsInitializedContent) {
	IsInitializedContent = true;

	// listen to message from the popup script.
	// every tab of the extension send a message to this script to get the information.
	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
		switch (message.info) {
			case INFO.SUMMARY:
				sendResponse({
					'meta': SEOInsights.Head.getCommonTags(),
					'ga': {
						'identifiers': SEOInsights.Head.getGoogleAnalytics(),
						'files': SEOInsights.File.getGoogleAnalyticsFiles()
					},
					'gtm': {
						'identifiers': SEOInsights.Head.getGoogleTagManager(),
						'files': SEOInsights.File.getGoogleTagManagerFiles()
					}
				});
				break;
			case INFO.META:
				sendResponse({
					'dublincore': SEOInsights.Meta.getDublineCoreTags(),
					'opengraph': SEOInsights.Meta.getOpenGraphTags(),
					'others': SEOInsights.Head.getOthers(),
					'parsely': SEOInsights.Meta.getParselyTags(),
					'shareaholic': SEOInsights.Meta.getShareaholicTags(),
					'twitter': SEOInsights.Meta.getTwitterTags()
				});
				break;
			case INFO.HEADINGS:
				sendResponse({
					'headings': SEOInsights.Heading.getHeadings()
				});
				break;
			case INFO.IMAGES:
				sendResponse({
					'images': SEOInsights.Image.getImages(),
					'icons': SEOInsights.Image.getIcons()
				});
				break;
			case INFO.LINKS:
				sendResponse({
					'alternate': SEOInsights.Head.getAlternateLinks(),
					'dnsprefetch': SEOInsights.Head.getDnsPrefetch(),
					'links': SEOInsights.Link.getLinks(),
					'preconnect': SEOInsights.Head.getPreconnect(),
					'preload': SEOInsights.Head.getPreload()
				});
				break;
			case INFO.FILES:
				sendResponse({
					'javascript': SEOInsights.File.getJavaScriptFiles(),
					'stylesheet': SEOInsights.File.getStylesheetFiles(),
					'googleanalytics': SEOInsights.File.getGoogleAnalyticsFiles(),
					'googletagmanager': SEOInsights.File.getGoogleTagManagerFiles()
				});
				break;
		}
	});
}
