/**
 * Module to get all the headings of the current website.
 */
var HeadingModule = (function() {

	/**
	 * Returns all headings of the given context.
	 * @param {object} context The context used to get the headings.
	 * @returns An array with all found headings.
	 */
	function GetHeadingsOfDocument(context = null) {
		let headings = [];

		//iterate through all heading elements of the context.
		$('h1, h2, h3, h4, h5, h6', context).each(function() {
			headings.push({
				'text': ($(this).text() || '').toString().trim(),
				'type': ($(this).prop('tagName') || '').toString().trim().toLowerCase()
			});
		});

		//return all the found headings.
		return headings;
	}

	return {

		/**
		 * Returns all headings of the current website.
		 * @returns An array with all found headings of the current website.
		 */
		GetHeadings: function() {
			let headings = GetHeadingsOfDocument();

			//there can be multiple documents (frames) on a website.
			//iterate through all frames of the website to get the headings of the available frames.
			for (let frameIndex = 0; frameIndex < window.frames.length; frameIndex++) {

				//there are also blocked frames so we have to try to get the document of the frame.
				try {
					headings = headings.concat(GetHeadingsOfDocument(window.frames[frameIndex].document));
				} catch(_) {}
			}

			//return all found headings of the website.
			return headings;
		}
	}
})();
