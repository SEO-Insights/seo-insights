/**
 * Module to get all the images of the current website.
 */
var ImageModule = (function() {

	/**
	 * Returns all images of the given context.
	 * @param {object} context The context used to get the images.
	 * @returns An array with all found images.
	 */
	function GetImagesOfDocument(context = null) {
		let images = [];

		//iterate through all images of the current context.
		$('img', context).each(function() {
			let imgSource = GetImageSource(($(this).attr('src') || '').toString().trim());

			//the image is not added to the array if the source is unknown.
			if (imgSource === null) {
				return;
			}

			//add the current image to the array.
			images.push({
				'alternative': ($(this).attr('alt') || '').toString().trim(),
				'filename': imgSource.filename,
				'source': imgSource.source,
				'title': ($(this).attr('title') || '').toString().trim()
			});
		});

		//return the array with all found images.
		return images;
	}

	/**
	 * Returns detailed information (source and filename) of the image source.
	 * @param {string} imgSource The source of the image to get detailed information.
	 * @returns An object with the source and the filename (if available).
	 */
	function GetImageSource(imgSource) {

		//if there is no image source or a data source the value can be returned.
		if (imgSource === '' || imgSource.startsWith('data:')) {
			return {
				'filename': '',
				'source': imgSource
			};
		}

		try {

			//check whether the image source starts with a protocol.
			//if there is no protocol, the current protocol of the website is used (relative protocol).
			if (imgSource.startsWith('//')) {
				imgSource = location.protocol + imgSource;
			}

			//get the image source as url object.
			let imgSourceUrl = new URL(imgSource, GetWebsiteBaseUrl());

			//return the image url and filename.
			return {
				'filename': imgSourceUrl.href.substring(imgSourceUrl.href.lastIndexOf('/') + 1),
				'source': imgSourceUrl.href
			};
		} catch(_) {
			return null;
		}
	}

	return {

		/**
		 * Returns all images of the current website.
		 * @returns An array with all found images of the website.
		 */
		GetImages: function() {
			let images = GetImagesOfDocument();

			//iterate through the frames of the page to get the images of the available frames.
			for (let frameIndex = 0; frameIndex < window.frames.length; frameIndex++) {

				//there are also blocked frames so we have to try to get the document of the frame.
				try {
					images = images.concat(GetImagesOfDocument(window.frames[frameIndex].document));
				} catch(_) {}
			}

			//return all found images of the website.
			return images;
		},

		/**
		 * Returns all icons of the website header.
		 * @returns An array with all found icons of the website.
		 */
		GetIcons: function() {
			let icons = [];

			//get the icons of the website header.
			$('head > link[rel="apple-touch-icon"], head > link[rel="icon"]').each(function() {
				icons.push({
					'sizes': ($(this).attr('sizes') || '').toString().trim(),
					'source': ($(this).attr('href') || '').toString().trim(),
					'type': ($(this).attr('type') || '').toString().trim()
				});
			});

			//return all the found icons of the website.
			return icons;
		}
	}
})();
