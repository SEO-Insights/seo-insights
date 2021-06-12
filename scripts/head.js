/**
 * Module for common meta information.
 */
var Meta = (function() {

	/**
	 * common tags to get information from.
	 */
	const tagsCommon = [
		'title'
	];

	/**
	 * common name attribute values to get information from.
	 */
	const namesCommon = [
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

	return {

		/**
		 * Returns the canonical information of the meta information.
		 * @returns {string} The canonical information of the meta information.
		 */
		GetCanonical: function() {
			return ($('head > link[rel="canonical"]').attr('href') || '').toString().trim();
		},

		/**
		 * Returns the information of the Google Tag Manager used on the website.
		 * @returns {object} The information of the Google Tag Manager used on the website.
		 */
		GetGoogleTagManager: function() {

			//set the regular expressions to get the identifiers of the Google Tag Manager.
			//there are two regular expression to get the identifiers of the Google Tag Manager with and without quotes.
			const regexUnquotedGTM = /GTM\-[0-9A-Z]{4,}/;
			const regexQuotedGTM = /(?<=['"])GTM\-[0-9A-Z]{4,}(?=['"])/;

			//clear the arrays for identifier and files.
			let identifier = [];
			let files = [];

			//get all Google Tag Manager files used on the website.
			$('script[src]').filter(function() {
				const url = new URL($(this).attr('src'), GetBaseUrl());

				//check whether the file is a volid Google Tag Manager file.
				return (
					(url.host === 'www.googletagmanager.com' && url.pathname.endsWith('/gtm.js') && regexUnquotedGTM.test(url.search))
				);
			}).each(function() {

				//get the url of the Google Tag Manager file and add the url to the file array.
				const url = ($(this).attr('src') || '').toString().trim();
				files.push(url);

				//get the identifier of the Google Tag Manager from url.
				const match = url.match(regexUnquotedGTM);

				//add the identifier of the Google Tag Manager if found on the url.
				if (match) {
					identifier.push({
						id: match[0],
						source: 'url'
					});
				}
			});

			//get all scripts of the website containing a Google Tag Manager identifier.
			$("script:not([src])").filter(function() {
				return regexQuotedGTM.test($(this).text());
			}).each(function() {

				//get all Google Tag Manager identifier of the current script.
				const matches = ($(this).text() || '').toString().match(new RegExp(regexQuotedGTM, 'g'));

				//set all the found identifiers of Google Tag Manager to the array.
				for (const id of (matches || []).filter(item => item !== null)) {
					identifier.push({
						id: id,
						source: 'script'
					});
				}
			});

			//return all the found information (files and identifiers) of the Google Tag Manager.
			return {
				tags: identifier,
				files: files
			};
		},

		/**
		 * Returns the information of Google Analytics Tracking used on the website.
		 * @returns {object} The information of Google Analytics Tracking used on the website.
		 */
		GetAnalytics: function() {

			//set the regular expressions to get the identifiers of the Google Analytics Tracking.
			//there are two regular expression to get the identifiers of the Google Analytics Tracking with and without quotes.
			const regexUnqoutedUA = /UA(\-\d+){2}/;
			const regexUnqoutedG = /G\-[A-Z0-9]/;
			const regexQuotedGTAG = /(?<=['"]config['"]\,[ ]*['"])UA(\-\d+){2}(?=['"])/;
			const regexQuotedAnalytics = /(?<=['"]create['"]\,[ ]*['"])UA(\-\d+){2}(?=['"])/;
			const regexQuotedGA = /(?<=['"]_setAccount['"]\,[ ]*['"])UA(\-\d+){2}(?=['"])/;
			const regexQuotedGA4 = /(?<=['"]config['"]\,[ ]*['"])G\-[0-9A-Z]+(?=['"])/;

			//clear the arrays for identifier and files.
			let identifier = [];
			let files = [];

			//get all Google Analytics Tracking files used on the website.
			$("script[src]").filter(function () {
				const url = new URL($(this).attr('src'), GetBaseUrl());

				//check whether the file is a volid Google Analytics Tracking file.
				return (
					(url.host === 'www.google-analytics.com' && url.pathname.endsWith('analytics.js'))
					|| (url.host === 'www.googletagmanager.com' && url.pathname.endsWith('/gtag/js') && regexUnqoutedUA.test(url.search))
					|| ((url.host === 'ssl.google-analytics.com' || url.host === 'www.google-analytics.com') && url.pathname.endsWith('ga.js'))
					|| (url.host === 'www.googletagmanager.com' && url.pathname.endsWith('/gtag/js') && regexUnqoutedG.test(url.search))
				);
			}).each(function() {

				//get the url of the Google Analytics Tracking file and add the url to the file array.
				const url = ($(this).attr('src') || '').toString().trim();
				files.push(url);

				//get the identifier from url and add to the matches array.
				let matches = [];
				matches.push(url.match(regexUnqoutedUA));
				matches.push(url.match(regexUnqoutedG));

				//set the identifiers to the array.
				for (const id of (matches || []).filter(item => item !== null)) {
					identifier.push({
						id: id,
						source: 'url'
					});
				}
			});

			//get all Google Analytics Tracking identifier of the scripts.
			$("script:not([src])").filter(function () {
				const script = $(this).text();
				return regexQuotedGTAG.test(script) || regexQuotedAnalytics.test(script) || regexQuotedGA.test(script) || regexQuotedGA4.test(script);
			}).each(function() {

				//get all identifiers from scripts.
				let matches = [];
				matches = matches.concat(($(this).text() || '').toString().match(new RegExp(regexQuotedGTAG, 'g')));
				matches = matches.concat(($(this).text() || '').toString().match(new RegExp(regexQuotedAnalytics, 'g')));
				matches = matches.concat(($(this).text() || '').toString().match(new RegExp(regexQuotedGA, 'g')));
				matches = matches.concat(($(this).text() || '').toString().match(new RegExp(regexQuotedGA4, 'g')));

				//set all the found identifier to the array.
				for (const id of (matches || []).filter(item => item !== null)) {
					identifier.push({
						id: id,
						source: 'script'
					});
				}
			});

			//return all the found information (files and identifiers) of the Google Analytics Tracking.
			return {
				tags: identifier,
				files: files
			};
		},

		/**
		 * Returns all meta information of the current website.
		 * @returns {object[]} All the found meta tags as objects.
		 */
		GetGeneral: function() {
			let tags = [];

			//iterate through all the meta elements with available name attribute.
			$('head > meta[name]').each(function() {
				const name = ($(this).attr('name') || '').toString().trim().toLowerCase();

				//only add known meta information to the array.
				if (namesCommon.includes(name)) {
					tags.push({
						'name': name,
						'value': ($(this).attr('content') || '').toString().trim()
					});
				}
			});

			//get the language information of the website.
			$('html[lang]').each(function() {
				tags.push({
					'name': 'lang',
					'value': ($(this).attr('lang') || '').toString().trim()
				});
			});

			//iterate through all the tags to get information from.
			for (let tagCommon of tagsCommon) {
				let itemTagCommon = $('head > ' + tagCommon).first();

				//add the tag information to the array if available.
				if (itemTagCommon) {
					tags.push({
						'name': tagCommon,
						'value': (itemTagCommon.text() || '').toString().trim()
					});
				}
			}

			//try to the get canonical link of the website.
			try {
				const canonical = Meta.GetCanonical();

				//add the canonical link to the tag array if available.
				if (canonical !== '') {
					tags.push({
						'name': 'canonical',
						'value': (new URL(canonical)).href
					});
				}
			} catch(_) {}

			//return all the found tags.
			return tags;
		},

		/**
		 * Returns all found alternate links of the website.
		 * @returns {object[]} All the found alternate links of the website.
		 */
		GetAlternateLinks: function() {
			let tags = [];

			//iterate through all the meta information with alternate link information.
			$('head > link[rel="alternate"]').each(function() {
				tags.push({
					'title': ($(this).attr('title') || '').toString().trim(),
					'href': ($(this).attr('href') || '').toString().trim(),
					'hreflang': ($(this).attr('hreflang') || '').toString().trim()
				});
			});

			//return all the found alternate link information of the website.
			return tags;
		},

		/**
		 * Returns all found preload information of the website.
		 * @returns {object[]} All the found preload information of the website.
		 */
		GetPreload: function() {
			let tags = [];

			//iterate through all the meta information with preload information.
			$('head > link[rel="preload"]').each(function() {
				tags.push({
					'href': ($(this).attr('href') || '').toString().trim(),
					'as': ($(this).attr('as') || '').toString().trim(),
					'type': ($(this).attr('type') || '').toString().trim()
				});
			});

			//return all the found preload information of the website.
			return tags;
		},

		/**
		 * Returns all found DNS prefetch information of the website.
		 * @returns {object[]} All the found DNS prefetch information of the website.
		 */
		GetDnsPrefetch: function() {
			let tags = [];

			//iterate through all the meta information with DNS prefetch information.
			$('head > link[rel="dns-prefetch"]').each(function() {
				tags.push({
					'href': ($(this).attr('href') || '').toString().trim()
				});
			});

			//returns all the found DNS prefetch information of the website.
			return tags;
		},

		/**
		 * Returns all found preconnect information of the website.
		 * @returns {object[]} All the found preconnect information of the website.
		 */
		GetPreconnect: function() {
			let tags = [];

			//iterate through all the meta information with preconnect information.
			$('head > link[rel="preconnect"]').each(function() {
				tags.push({
					'href': ($(this).attr('href') || '').toString().trim()
				});
			});

			//returns all the found preconnect information of the website.
			return tags;
		},

		/**
		 * Returns all found meta information not covered in specific groups.
		 * @returns {object[]} All the found meta information not covered in specific groups.
		 */
		GetOthers: function() {
			let tags = [];

			//iterate through all meta elements with available name attribute.
			$('head > meta[name]').each(function() {
				const name = ($(this).attr('name') || '').toString().trim();

				//don't add the meta information if Dublin Core.
				if (MetaInfo.IsDublinCoreTag(name)) {
					return;
				}

				//don't add the meta information if Twitter.
				if (MetaInfo.IsTwitterTag(name)) {
					return;
				}

				//don't add the meta information if Parse.ly.
				if (MetaInfo.IsParselyTag(name)) {
					return;
				}

				//don't add the meta information if Shareaholic.
				if (MetaInfo.IsShareaholicTag(name)) {
					return;
				}

				//don't add the meta information if Open Graph or available as common tag.
				if (MetaInfo.IsOpenGraphTag(name) || namesCommon.includes(name)) {
					return;
				}

				//add the tag to the array.
				tags.push({
					'name': name,
					'value': ($(this).attr('content') || '').toString().trim()
				});
			});

			//iterate through all meta elements with available property attribute.
			$('head > meta[property]').each(function() {
				const property = ($(this).attr('property') || '').toString().trim();

				//don't add the meta information if Dublin Core.
				if (MetaInfo.IsDublinCoreTag(property)) {
					return;
				}

				//don't add the meta information if Twitter.
				if (MetaInfo.IsTwitterTag(property)) {
					return;
				}

				//don't add the meta information if Parse.ly.
				if (MetaInfo.IsParselyTag(property)) {
					return;
				}

				//don't add the meta information if Open Graph.
				if (MetaInfo.IsOpenGraphTag(property)) {
					return;
				}

				//add the tag to the array.
				tags.push({
					'name': property,
					'value': ($(this).attr('content') || '').toString().trim()
				});
			});

			//iterate through all HTTP equivalent information of the website.
			$('head > meta[http-equiv]').each(function() {
				tags.push({
					'name': ($(this).attr('http-equiv') || '').toString().trim(),
					'value': ($(this).attr('content') || '').toString().trim()
				});
			});

			//iterate through all charset information of the website.
			$('head > meta[charset]').each(function() {
				tags.push({
					'name': 'charset',
					'value': ($(this).attr('charset') || '').toString().trim()
				});
			});

			//return all found tags.
			return tags;
		}
	}
})();
