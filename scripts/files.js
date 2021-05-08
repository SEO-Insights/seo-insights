/**
 * Module for Files
 */
var FileModule = (function() {
	return {

		/**
		 * Returns all JavaScript files of the current website.
		 * @returns An array with all found JavaScript files of the website.
		 */
		GetJavaScriptFiles: function() {
			let files = [];

			//get all JavaScript files of the website.
			$('script[src]').each(function() {

				//get the source of the file and the url object.
				let sourceJavaScript = ($(this).attr('src') || '').toString().trim();
				let urlJavaScript = new URL(sourceJavaScript, GetBaseUrl());

				//add the JavaScript file to the file array.
				files.push({
					'original': sourceJavaScript,
					'async': $(this).attr('async') ? true : false,
					'charset': ($(this).attr('charset') || '').toString().trim(),
					'url': {
						'href': urlJavaScript.href,
						'origin': urlJavaScript.origin
					}
				});
			});

			//return all found JavaScript files.
			return files;
		},

		/**
		 * Returns all Stylesheet files of the current website.
		 * @returns An array with all found Stylesheet files of the website.
		 */
		GetStylesheetFiles: function() {
			let files = [];

			//get all Stylesheet files of the website.
			$('link[rel="stylesheet"]').each(function() {

				//get the source of the file and the url object.
				let sourceStylesheet = ($(this).attr('href') || '').toString().trim();
				let urlStylesheet = new URL(sourceStylesheet, GetBaseUrl());

				//add the Stylesheet file to the file array.
				files.push({
					'original': sourceStylesheet,
					'media': ($(this).attr('media') || '').toString().trim(),
					'url': {
						'href': urlStylesheet.href,
						'origin': urlStylesheet.origin
					}
				});
			});

			//return all found Stylesheet files.
			return files;
		}
	};
})();
