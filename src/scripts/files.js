// create the namespace of SEO Insights if the namespace doesn't exist.
var SEOInsights = (SEOInsights || {});

/**
 * The File class of SEO Insights to get information of files used on a website.
 */
SEOInsights.File = class File {

	/**
	 * Checks whether a url is a Google Analytics url.
	 * @param {URL} url The url to check for Google Analytics url.
	 * @returns {boolean} State whether the url is a Google Analytics url.
	 */
	static isGoogleAnalyticsUrl(url) {

		/**
		 * How to detect Google Analytics files?
		 *
		 * The detection of Google Analytics files works only with the URL of the included file.
		 * The differentiation between the different Google Analytics variants is made via the
		 * hostname, pathname and by a possibly existing ID.
		 *
		 * Google Analytics using analytics.js:
		 *   - Hostname: www.google-analytics.com
		 *   - Pathname: analytics.js
		 *
		 * Google Analytics using ga.js:
		 *   - Hostname: ssl.google-analytics.com or www.google-analytics.com
		 *   - Pathname: ga.js
		 *
		 * Google Analytics using Universal Analytics:
		 *   - Hostname: www.googletagmanager.com
		 *   - Pathname: /gtag/js
		 *   - There is also a Google Analytics Tracking ID (e.g. UA-XXXXX-XXXXX)
		 *
		 * Google Analytics using Google Analytics 4:
		 *   - Hostname: www.googletagmanager.com
		 *   - Pathname: /gtag/js
		 *   - There is also a Google Analytics 4 Tracking-ID (e.g. G-XXXXXX)
		 */
		return (
			(url.hostname === 'www.google-analytics.com' && url.pathname.toLowerCase().endsWith('analytics.js'))
			|| (['www.google-analytics.com', 'ssl.google-analytics.com'].includes(url.hostname) && url.pathname.toLowerCase().endsWith('ga.js'))
			|| (url.hostname === 'www.googletagmanager.com' && url.pathname.toLowerCase().endsWith('/gtag/js') && (/UA(-\d+){2}/.test(url.search) || /G-[A-Z0-9]/.test(url.search)))
		);
	}

	/**
	 * Checks whether a url is a Google Tag Manager url.
	 * @param {URL} url The url to check for Google Tag Manager url.
	 * @returns {boolean} State whether the url is a Google Tag Manager url.
	 */
	static isGoogleTagManagerUrl(url) {

		/**
		 * How to detect Google Tag Manager files?
		 *
		 * The detection of Google Tag Manager files works only with the URL of the included file.
		 * The differentiation between the different Google Analytics variants is made via the
		 * hostname, pathname and by a possibly existing ID.
		 */
		return (
			url.hostname === 'www.googletagmanager.com' && url.pathname.toLowerCase().endsWith('/gtm.js') && /GTM-[0-9A-Z]{4,}/.test(url.search)
		);
	}

	/**
	 * Returns all Google Analytics files of the website.
	 * @returns {Array<object>} An array with all found Google Analytics files of the website.
	 */
	static getGoogleAnalyticsFiles() {
		const files = [];

		// get all Google Analytics files of the website.
		$('script[src]').filter(function() {
			const url = new URL(($(this).attr('src') || '').toString().trim(), getBaseUrl());
			return SEOInsights.File.isGoogleAnalyticsUrl(url);
		}).each(function() {
			const url = new URL(($(this).attr('src') || '').toString().trim(), getBaseUrl());

			// add the url of the file to the file array.
			files.push({
				original: ($(this).attr('src') || '').toString().trim(),
				async: $(this).attr('async') ? true : false,
				charset: ($(this).attr('charset') || '').toString().trim(),
				url: {
					href: url.href,
					origin: url.origin,
				},
			});
		});

		// return all the found files.
		return files;
	}

	/**
	 * Returns all Google Tag Manager files of the website.
	 * @returns {Array<object>} An array with all found Google Tag Manager files of the website.
	 */
	static getGoogleTagManagerFiles() {
		const files = [];

		// get all Google Tag Manager files of the website.
		$('script[src]').filter(function() {
			const url = new URL(($(this).attr('src') || '').toString().trim(), getBaseUrl());
			return SEOInsights.File.isGoogleTagManagerUrl(url);
		}).each(function() {
			const url = new URL(($(this).attr('src') || '').toString().trim(), getBaseUrl());

			// add the url of the file to the file array.
			files.push({
				original: ($(this).attr('src') || '').toString().trim(),
				async: $(this).attr('async') ? true : false,
				charset: ($(this).attr('charset') || '').toString().trim(),
				url: {
					href: url.href,
					origin: url.origin,
				},
			});
		});

		// return all the found files.
		return files;
	}

	/**
	 * Returns all JavaScript files of the website.
	 * @returns {Array<object>} An array with all found JavaScript files of the website.
	 */
	static getJavaScriptFiles() {
		const files = [];

		// get all JavaScript files of the website.
		$('script[src]').filter(function() {
			return (($(this).attr('src') || '').toString().trim() !== '');
		}).each(function() {
			const url = new URL(($(this).attr('src') || '').toString().trim(), getBaseUrl());

			// add the url of the file to the file array.
			files.push({
				original: ($(this).attr('src') || '').toString().trim(),
				async: $(this).attr('async') ? true : false,
				charset: ($(this).attr('charset') || '').toString().trim(),
				url: {
					href: url.href,
					origin: url.origin,
				},
			});
		});

		// return all the found files.
		return files;
	}

	/**
	 * Returns all Stylesheet files of the website.
	 * @returns {Array<object>} An array with all found Stylesheet files of the website.
	 */
	static getStylesheetFiles() {
		const files = [];

		// get all Stylesheet files of the website.
		$('link[rel="stylesheet"]').filter(function() {
			return (($(this).attr('href') || '').toString().trim() !== '');
		}).each(function() {
			const url = new URL(($(this).attr('href') || '').toString().trim(), getBaseUrl());

			// add the url of the file to the file array.
			files.push({
				original: ($(this).attr('href') || '').toString().trim(),
				media: ($(this).attr('media') || '').toString().trim(),
				url: {
					href: url.href,
					origin: url.origin,
				},
			});
		});

		// return all the found files.
		return files;
	}
};
