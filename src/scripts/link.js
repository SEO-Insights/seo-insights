// create the namespace of SEO Insights if the namespace doesn't exist.
var SEOInsights = (SEOInsights || {});

/**
 * The Link class of SEO Insights to get information of links used on a website.
 */
SEOInsights.Link = class Link {

	/**
	 * Returns all links of the specified context.
	 * @param {object} context The specified context to get all the links.
	 * @returns {Array<object>} An array with all found links of the specified context.
	 */
	static getLinksOfDocument(context = null) {
		const links = [];

		// iterate through all links of the specified context.
		// add all the links of the specified context (also links without target).
		$('a', context).each(function() {
			const href = ($(this).attr('href') ||  '').toString().trim();

			// set all the basic information into the link object.
			// the basic information is located at the link element directly.
			const link = {
				href: href,
				rel: ($(this).attr('rel') || '').toString().trim(),
				target: ($(this).attr('target') || '').toString().trim(),
				title: ($(this).attr('title') || '').toString().trim()
			};

			// set the url information to the link object if a target is available.
			if (href !== '') {
				try {

					// get the url object of the current link.
					// this can also be used to make sure the link is a valid url.
					const url = new URL(href, getBaseUrl());

					// ignore the current link if it is a link of an extension.
					// an extension can also set elements to the website.
					if (url.protocol === 'chrome-extension:') {
						return;
					}

					// set the information of the url object to the link information.
					link.url = {
						hash: (url.hash || '').toString().trim(),
						href: (url.href || '').toString().trim(),
						origin: (url.origin || '').toString().trim(),
						path: (url.pathname || '').toString().trim(),
						protocol: (url.protocol || '').toString().trim().replace(':', '')
					};
				} catch(_e) {}
			}

			// add the link information to the array.
			links.push(link);
		});

		// return all the found links.
		return links;
	}

	/**
	 * Returns all links of the current website.
	 * @returns {Array<object>} An array with all found links of the website.
	 */
	static getLinks() {
		let links = SEOInsights.Link.getLinksOfDocument();

		// iterate through the frames of the page to get the links of the available frames.
		// there are also blocked frames so we have to try to get the document of the frame.
		for (let frameIndex = 0; frameIndex < window.frames.length; frameIndex++) {
			try {
				links = links.concat(SEOInsights.Link.getLinksOfDocument(window.frames[frameIndex].document));
			} catch(_e) {}
		}

		// return all the found links of the website.
		return links;
	}
};
