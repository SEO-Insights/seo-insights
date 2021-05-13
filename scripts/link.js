/**
 * Module for Links.
 */
var LinkModule = (function() {

	/**
	 * Returns all links of the specified context.
	 * @param {object} context The specified context to get all the links.
	 * @returns An array with all found links of the specified context.
	 */
	function GetLinksOfDocument(context = null) {
		let links = [];

		//iterate through all links of the specified context.
		//add all the links of the specified context. also add links without target.
		$('a', context).each(function() {
			try {

				//get the target of the current link. there are also links without a target.
				const href = ($(this).attr('href') ||  '').toString().trim();

				//add the link directly to the array if target is missing.
				if (href === '') {
					links.push({
						'href': href,
						'rel': ($(this).attr('rel') || '').toString().trim(),
						'target': ($(this).attr('target') || '').toString().trim(),
						'title': ($(this).attr('title') || '').toString().trim(),
						'url': {
							'hash': '',
							'href': '',
							'origin': '',
							'path': '',
							'protocol': ''
						}
					});
				} else {

					//get the url object of the current link.
					//this can also be used to make sure the link is a valid url.
					const urlObject = new URL(href, GetBaseUrl());

					//ignore the links of other extensions.
					if (urlObject.protocol === 'chrome-extension:') {
						return;
					}

					//add the link with target to the array.
					links.push({
						'href': href,
						'rel': ($(this).attr('rel') || '').toString().trim(),
						'target': ($(this).attr('target') || '').toString().trim(),
						'title': ($(this).attr('title') || '').toString().trim(),
						'url': {
							'hash': (urlObject.hash || '').toString().trim(),
							'href': (urlObject.href || '').toString().trim(),
							'origin': (urlObject.origin || '').toString().trim(),
							'path': (urlObject.pathname || '').toString().trim(),
							'protocol': (urlObject.protocol || '').toString().trim().replace(':', '')
						}
					});
				}
			} catch(_) {}
		});

		//return all found links of the specified context.
		return links;
	}

	return {

		/**
		 * Returns all links of the current website.
		 * @returns An array with all found links of the website.
		 */
		GetLinks: function() {
			let links = GetLinksOfDocument();

			//iterate through the frames of the page to get the links of the available frames.
			for (let frameIndex = 0; frameIndex < window.frames.length; frameIndex++) {

				//there are also blocked frames so we have to try to get the document of the frame.
				try {
					links = links.concat(GetLinksOfDocument(window.frames[frameIndex].document));
				} catch(_) {}
			}

			//return all the found links of the website.
			return links;
		}
	}
})();
