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
		 * Returns all found Dublin Core information of the website.
		 * @returns {object[]} All the found Dublin Core information of the website.
		 */
		GetDublinCore: function() {
			let tags = [];

			//iterate through all the meta information with available name attribute.
			$('head > meta[name]').filter(function() {
				return ($(this).attr('name').toUpperCase().startsWith('DC.') || $(this).attr('name').toUpperCase().startsWith('DCTERMS.'));
			}).each(function() {
				tags.push({
					'name': ($(this).attr('name') || '').toString().trim(),
					'value': ($(this).attr('content') || '').toString().trim()
				});
			});

			//return all the found Dublin Core tags of the website.
			return tags;
		},

		/**
		 * Returns all found Parse.ly information of the website.
		 * @returns {object[]} All the found Parse.ly information of the website.
		 */
		GetParsely: function() {
			let tags = [];

			//iterate through all the meta information with available name attribute.
			$('head > meta[name]').filter(function() {
				return $(this).attr('name').toLowerCase().trim().startsWith('parsely-');
			}).each(function() {
				tags.push({
					'name': ($(this).attr('name') || '').toString().trim(),
					'value': ($(this).attr('content') || '').toString().trim()
				});
			});

			//return all the found Parse.ly tags of the website.
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
				if (name.toUpperCase().startsWith('DC.') || name.toUpperCase().startsWith('DCTERMS.')) {
					return;
				}

				//don't add the meta information if Twitter.
				if (MetaInfo.IsTwitterTag(name)) {
					return;
				}

				//don't add the meta information if Parse.ly.
				if (name.toLowerCase().startsWith('parsely-')) {
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

				//don't add the meta information if Twitter.
				if (MetaInfo.IsTwitterTag(property)) {
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
