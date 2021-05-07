/**
 * Module for Hyperlinks.
 */
var LinkModule = (function() {

	/**
	 * Returns all hyperlinks of the given context.
	 * @param {object} context The context used to get the hyperlinks.
	 * @returns An array with all found hyperlinks.
	 */
	function GetLinksOfDocument(context = null) {
		let links = [];

		//iterate through all hyperlinks of the current context.
		$('a', context).each(function() {
			try {

				//get the url of the hyperlink element.
				let strLinkUrl = ($(this).attr('href') || '').toString().trim();

				//get the url object of the current hyperlink.
				//this can also be used to make sure the link is a valid url.
				let linkUrl = new URL(strLinkUrl, GetBaseUrl());

				//add the information of the hyperlink as object to the array.
				links.push({
					'rel': ($(this).attr('rel') || '').toString().trim(),
					'title': ($(this).attr('title') || '').toString().trim(),
					'url': {
						'hash': (linkUrl.hash || '').toString().trim(),
						'href': (linkUrl.href || '').toString().trim(),
						'origin': (linkUrl.origin || '').toString().trim(),
						'path': (linkUrl.pathname || '').toString().trim(),
						'protocol': (linkUrl.protocol || '').toString().trim().replace(':', '')
					}
				});
			} catch(_) { }
		});

		//return all the found hyperlinks.
		return links;
	}

	return {

		/**
		 * Returns all hyperlinks of the current website.
		 * @returns An array with all found hyperlinks of the website.
		 */
		GetLinks: function() {
			let links = GetLinksOfDocument();

			//iterate through the frames of the page to get the hyperlinks of the available frames.
			for (let frameIndex = 0; frameIndex < window.frames.length; frameIndex++) {

				//there are also blocked frames so we have to try to get the document of the frame.
				try {
					links = links.concat(GetLinksOfDocument(window.frames[frameIndex].document));
				} catch(_) {}
			}

			//return all the found hyperlinks.
			return links;
		}
	}
})();
