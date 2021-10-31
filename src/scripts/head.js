// create the namespace of SEO Insights if the namespace doesn't exist.
var SEOInsights = (SEOInsights || {});

/**
 * The Head class of SEO Insights to get information from the <head> of the website.
 */
SEOInsights.Head = class Head {

	/**
	 * Returns all common names to get from <head>.
	 * @returns {Array<string>} The common names  to get from <head>.
	 */
	static GetArrayCommonNames() {
		return [
			'application-name',
			'author',
			'bingbot',
			'description',
			'generator',
			'google',
			'googlebot',
			'google-site-verification',
			'keywords',
			'msnbot',
			'rating',
			'referrer',
			'robots',
			'theme-color',
			'viewport'
		];
	}

	/**
	 * Returns all common tags to get from <head>.
	 * @returns {Array<string>} The common tags to get from <head>.
	 */
	static GetArrayCommonTags() {
		return [
			'title'
		];
	}

	/**
	 * Returns the canonical url of the website, defined on the <head>.
	 * @returns {string} The canonical url of the website.
	 */
	static GetCanonical() {
		return ($('head > link[rel="canonical"]').attr('href') || '').toString().trim();
	}

	/**
	 * Returns the preconnect information of the website.
	 * @returns {Array<object>} The found preconnect information of the website.
	 */
	static GetPreconnect() {
		const tags = [];

		// iterate through the preconnect information.
		$('head > link[rel="preconnect"]').each(function() {
			tags.push({
				href: ($(this).attr('href') || '').toString().trim()
			});
		});

		// return the found preconnect information.
		return tags;
	}

	/**
	 * Returns the DNS prefetch information of the website.
	 * @returns {Array<object>} The found DNS prefetch information of the website.
	 */
	static GetDnsPrefetch() {
		const tags = [];

		// iterate through the DNS prefetch information of the website.
		$('head > link[rel="dns-prefetch"]').each(function() {
			tags.push({
				href: ($(this).attr('href') || '').toString().trim()
			});
		});

		// return the found DNS prefetch information.
		return tags;
	}

	/**
	 * Returns the alternate links of the website.
	 * @returns {Array<object>} The found alternate links of the website.
	 */
	static GetAlternateLinks() {
		const tags = [];

		// iterate through the alternate links of the website.
		$('head > link[rel="alternate"]').each(function() {
			tags.push({
				title: ($(this).attr('title') || '').toString().trim(),
				href: ($(this).attr('href') || '').toString().trim(),
				hreflang: ($(this).attr('hreflang') || '').toString().trim()
			});
		});

		// return the found alternate links of the website.
		return tags;
	}

	/**
	 * Returns the preload information of the website.
	 * @returns {Array<object>} The found preload information of the website.
	 */
	static GetPreload() {
		const tags = [];

		// iterate through the preload information of the website.
		$('head > link[rel="preload"]').each(function() {
			tags.push({
				href: ($(this).attr('href') || '').toString().trim(),
				as: ($(this).attr('as') || '').toString().trim(),
				type: ($(this).attr('type') || '').toString().trim()
			});
		});

		// return the found preload information.
		return tags;
	}

	/**
	 * Returns the common information of the website.
	 * @returns {Array<object>} The found common information of the website.
	 */
	static GetCommonTags() {
		const tags = [];

		// iterate through the elements of the website to get the elements with common names.
		$('head > meta[name]').filter(function() {
			return SEOInsights.Head.GetArrayCommonNames().includes(($(this).attr('name') || '').toString().trim().toLowerCase());
		}).each(function() {
			tags.push({
				name: ($(this).attr('name') || '').toString().trim().toLowerCase(),
				value: ($(this).attr('content') || '').toString().trim()
			});
		});

		// get the language information of the website.
		$('html[lang]').each(function() {
			tags.push({
				name: 'lang',
				value: ($(this).attr('lang') || '').toString().trim()
			});
		});

		// iterate through the common tags of the website.
		for (const tagCommon of SEOInsights.Head.GetArrayCommonTags()) {
			const itemTagCommon = $(`head > ${tagCommon}`).first();

			// add the tag information to the array if available.
			if (itemTagCommon) {
				tags.push({
					name: tagCommon,
					value: (itemTagCommon.text() || '').toString().trim()
				});
			}
		}

		// get the canonical url of the website.
		const canonical = SEOInsights.Head.GetCanonical();

		// add the canonical link to the tag array if available.
		if (canonical !== '') {
			tags.push({
				name: 'canonical',
				value: decodeURI((new URL(canonical, GetBaseUrl())).href)
			});
		}

		// return the found common information.
		return tags;
	}

	/**
	 * Returns the identifiers of the Google Tag Manager found on the website.
	 * @returns {Array<object>} The identifiers of the Google Tag Manager found on the website.
	 */
	static GetGoogleTagManager() {
		const identifier = [];

		// set the regular expressions to get the identifiers of the Google Tag Manager.
		// there are two regular expressions to get the identifiers of the Google Tag Manager with and without quotes.
		// these regular expressions are defined without modifiers. the modifiers are set on usage if needed.
		const regexQuotedGTM = /(?<=['"])GTM\-[0-9A-Z]{4,}(?=['"])/;
		const regexUnquotedGTM = /GTM\-[0-9A-Z]{4,}/;

		// get all files of Google Tag Manager to find identifiers.
		const files = SEOInsights.File.GetGoogleTagManagerFiles();

		// iterate through all the files to get the identifiers.
		for (const file of files) {

			// get the identifiers of the Google Tag Manager file url.
			const matches = file.original.match(new RegExp(regexUnquotedGTM, 'g'));

			// set the found identifiers of the file url to the array.
			for (const id of (matches || []).filter(item => item !== null)) {
				identifier.push({
					id: id,
					source: 'url'
				});
			}
		}

		// get the scripts of the website containing a Google Tag Manager identifier.
		$("script:not([src])").filter(function() {
			return regexQuotedGTM.test($(this).text());
		}).each(function() {

			// get the Google Tag Manager identifier of the current script.
			const matches = ($(this).text() || '').toString().match(new RegExp(regexQuotedGTM, 'g'));

			// set the found identifiers of the script to the array.
			for (const id of (matches || []).filter(item => item !== null)) {
				identifier.push({
					id: id,
					source: 'script'
				});
			}
		});

		// return the found identifiers of the Google Tag Manager.
		return identifier;
	}

	/**
	 * Returns the identifiers of Google Analytics found on the website.
	 * @returns {Array<object>} The identifiers of Google Analytics found on the website.
	 */
	static GetGoogleAnalytics() {
		const identifier = [];

		// set the regular expressions to get the identifiers of Google Analytics.
		// there are two regular expressions to get the identifiers of Google Analytics with and without quotes.
		// these regular expressions are defined without modifiers. the modifiers are set on usage if needed.
		const regexUnqoutedUA = /UA(\-\d+){2}/;
		const regexUnqoutedG = /G\-[A-Z0-9]+/;
		const regexQuotedGTAG = /(?<=['"]config['"]\,[ ]*['"])UA(\-\d+){2}(?=['"])/;
		const regexQuotedAnalytics = /(?<=['"]create['"]\,[ ]*['"])UA(\-\d+){2}(?=['"])/;
		const regexQuotedGA = /(?<=['"]_setAccount['"]\,[ ]*['"])UA(\-\d+){2}(?=['"])/;
		const regexQuotedGA4 = /(?<=['"]config['"]\,[ ]*['"])G\-[0-9A-Z]+(?=['"])/;

		// get the files of Google Analytics to find identifiers.
		const files = SEOInsights.File.GetGoogleAnalyticsFiles();

		// iterate through the Google Analytics files to get the identifiers.
		for (const file of files) {
			let matches = [];

			// get the identifiers of Google Analytics file url.
			matches = matches.concat(file.original.match(new RegExp(regexUnqoutedUA, 'g')));
			matches = matches.concat(file.original.match(new RegExp(regexUnqoutedG, 'g')));

			// set the identifiers to the array.
			for (const id of (matches || []).filter(item => item !== null)) {
				identifier.push({
					id: id,
					source: 'url'
				});
			}
		}

		// get the scripts of the website containing Google Analytics identifier.
		$("script:not([src])").filter(function() {
			const script = $(this).text();
			return regexQuotedGTAG.test(script) || regexQuotedAnalytics.test(script) || regexQuotedGA.test(script) || regexQuotedGA4.test(script);
		}).each(function() {
			let matches = [];

			// get the identifiers from scripts using the regular expressions.
			matches = matches.concat(($(this).text() || '').toString().match(new RegExp(regexQuotedGTAG, 'g')));
			matches = matches.concat(($(this).text() || '').toString().match(new RegExp(regexQuotedAnalytics, 'g')));
			matches = matches.concat(($(this).text() || '').toString().match(new RegExp(regexQuotedGA, 'g')));
			matches = matches.concat(($(this).text() || '').toString().match(new RegExp(regexQuotedGA4, 'g')));

			// set the found identifiers to the array.
			for (const id of (matches || []).filter(item => item !== null)) {
				identifier.push({
					id: id,
					source: 'script'
				});
			}
		});

		// return the found identifiers of Google Analytics.
		return identifier;
	}

	/**
	 * Returns the information not found with other methods / functions of SEO Insights.
	 * @returns {Array<object>} The information not found with other methods / functions of SEO Insights.
	 */
	static GetOthers() {
		const tags = [];

		// get the meta information from meta elements with name property.
		$('head > meta[name]').filter(function() {
			const name = ($(this).attr('name') || '').toString().trim();
			return !SEOInsights.Meta.IsDublinCoreTag(name) &&
				!SEOInsights.Meta.IsTwitterTag(name) &&
				!SEOInsights.Meta.IsParselyTag(name) &&
				!SEOInsights.Meta.IsShareaholicTag(name) &&
				!SEOInsights.Meta.IsOpenGraphTag(name) &&
				!SEOInsights.Head.GetArrayCommonNames().includes(name);
		}).each(function() {
			const name = ($(this).attr('name') || '').toString().trim();

			// set the meta information to the array.
			tags.push({
				name: name,
				value: ($(this).attr('content') || '').toString().trim()
			});
		});

		// get the meta information from meta elements with property property.
		$('head > meta[property]').filter(function() {
			const property = ($(this).attr('property') || '').toString().trim();
			return !SEOInsights.Meta.IsDublinCoreTag(property) &&
				!SEOInsights.Meta.IsTwitterTag(property) &&
				!SEOInsights.Meta.IsParselyTag(property) &&
				!SEOInsights.Meta.IsOpenGraphTag(property);
		}).each(function() {
			const property = ($(this).attr('property') || '').toString().trim();

			// set the meta information to the array.
			tags.push({
				name: property,
				value: ($(this).attr('content') || '').toString().trim()
			});
		});

		// iterate through the HTTP equivalent information of the website.
		$('head > meta[http-equiv]').each(function() {
			tags.push({
				name: ($(this).attr('http-equiv') || '').toString().trim(),
				value: ($(this).attr('content') || '').toString().trim()
			});
		});

		// iterate through the charset information of the website.
		$('head > meta[charset]').each(function() {
			tags.push({
				name: 'charset',
				value: ($(this).attr('charset') || '').toString().trim()
			});
		});

		// return the found meta information not found with other methods / functions of SEO Insights.
		return tags;
	}
};
