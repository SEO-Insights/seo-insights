//create the namespace of SEO Insights if the namespace doesn't exist.
if (SEOInsights === undefined) {
  var SEOInsights = {};
}

/**
 * The Image class of SEO Insights to get information of images used on a website.
 */
SEOInsights.Image = class Image {

	/**
	 * Returns detailed information (source and filename) of the image source.
	 * @param {string} src The source of the image to get detailed information.
	 * @returns {object} An object with the source and the filename (if available).
	 */
	static GetImageSource(src) {

		//if there is no image source or a data source the value can be returned.
		//there is no possibility to get a url object with advanced information.
		if (src.trim() === '' || src.startsWith('data:')) {
			return {
				filename: '',
				source: src
			};
		}

		//try to get a url object with advanced information.
		try {

			//get the image source as url object to get the advanced information.
			//if there is no protocol, the current protocol of the website is used (relative protocol).
			const srcUrl = new URL(src, GetBaseUrl());

			//ignore images of other extensions. chrome and edge use the same protocol.
			if (srcUrl.protocol === 'chrome-extension:') {
				return null;
			}

			//return the image url and filename of the image source.
			return {
				filename: srcUrl.href.substring(srcUrl, srcUrl.href.lastIndexOf('/') + 1),
				source: srcUrl.href
			};
		} catch(_) {
			return null;
		}
	}

	/**
	 * Returns all images of the specified context.
	 * @param {object} context The specified context to get all the images.
	 * @returns {Array<object>} An array with all found images of the specified context.
	 */
	static GetImagesOfDocument(context = null) {
		let images = [];

		//iterate through all images of the specified context.
		$('img', context).filter(function() {
			return (SEOInsights.Image.GetImageSource(($(this).attr('src') || '').toString().trim()) !== null);
		}).each(function() {
			const source = SEOInsights.Image.GetImageSource(($(this).attr('src') || '').toString().trim());

			//add the current image to the array.
			images.push({
				alt: ($(this).attr('alt') || '').toString().trim(),
				filename: source.filename,
				src: ($(this).attr('src') || '').toString().trim(),
				source: source.source,
				title: ($(this).attr('title') || '').toString().trim()
			});
		});

		//return all the found images of the website.
		return images;
	}

	/**
	 * Returns all images of the current website.
	 * @returns {Array<object>} An array with all found images of the website.
	 */
	static GetImages() {
		let images = SEOInsights.Image.GetImagesOfDocument();

		//iterate through the frames of the page to get the images of the available frames.
		for (let frameIndex = 0; frameIndex < window.frames.length; frameIndex++) {

			//there are also blocked frames so we have to try to get the document of the frame.
			try {
				images = images.concat(GetImagesOfDocument(window.frames[frameIndex].document));
			} catch(_) {}
		}

		//return all found images of the website.
		return images;
	}

	/**
	 * Returns all icons of the current website.
	 * @returns {Array<object>} An array with all found icons of the website.
	 */
	static GetIcons() {
		let icons = [];

		//iterate through all icons of the website header.
		$('head > link[rel*="icon"]').filter(function() {
			return (SEOInsights.Image.GetImageSource(($(this).attr('href') || '').toString().trim()) !== null);
		}).each(function() {
			const source = SEOInsights.Image.GetImageSource(($(this).attr('href') || '').toString().trim());

			//add the icon to the array.
			icons.push({
				href: ($(this).attr('href') || '').toString().trim(),
				filename: source.filename,
				sizes: ($(this).attr('sizes') || '').toString().trim(),
				source: source.source,
				type: ($(this).attr('type') || '').toString().trim()
			});
		});

		//return all found icons of the website.
		return icons;
	}
}
