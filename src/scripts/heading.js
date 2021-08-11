//create the namespace of SEO Insights if the namespace doesn't exist.
if (SEOInsights === undefined) {
  var SEOInsights = {};
}

/**
 * The Heading class of SEO Insights to get information of headings used on a website.
 */
SEOInsights.Heading = class Heading {

	/**
	 * Returns all headings of the specified context.
	 * @param {object} context The specified context to get all the headings.
	 * @returns {Array<object>} An array with all found headings of the specified context.
	 */
	static GetHeadingsOfDocument(context = null) {
		let headings = [];

		//iterate through all headings of the specified context.
		//add all the headings of the specified context.
		$('h1, h2, h3, h4, h5, h6', context).each(function() {
			headings.push({
				text: ($(this).text() || '').toString().trim(),
				type: ($(this).prop('tagName') || '').toString().trim().toLowerCase()
			});
		});

		//return all the found headings.
		return headings;
	}

	/**
	 * Returns all headings of the current website.
	 * @returns {Array<object>} An array with all found headings of the website.
	 */
	static GetHeadings() {
		let headings = SEOInsights.Heading.GetHeadingsOfDocument();

		//iterate through the frames of the page to get the headings of the available frames.
		//there are also blocked frames so we have to try to get the document of the frame.
		for (let frameIndex = 0; frameIndex < window.frames.length; frameIndex++) {
			try {
				headings = headings.concat(SEOInsights.Heading.GetHeadingsOfDocument(window.frames[frameIndex].document));
			} catch(_) {}
		}

		//return all the found headings of the website.
		return headings;
	}
}
