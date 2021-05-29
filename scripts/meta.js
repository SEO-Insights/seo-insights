/**
 * Module to collect Meta information from website.
 */
var MetaInfo = (function() {

	/**
	 * All known Shareaholic tags.
	 * @see https://github.com/shareaholic/shareaholic-api-docs/blob/master/shareaholic_meta_tags.md
	 */
	const tagsShareaholic = {
		content: [
			{ name: 'shareaholic:url', description: 'The canonical URL for the webpage.' },
			{ name: 'shareaholic:image', description: 'The URL of the image that represents the webpage.' },
			{ name: 'shareaholic:title', description: 'The title that represents the webpage.' },
			{ name: 'shareaholic:article_author_name', description: 'The name of the author of the content of the webpage' },
			{ name: 'shareaholic:article_author', description: 'An URL to the profile of the author of the content of the webpage.' },
			{ name: 'shareaholic:keywords', description: 'Keywords associated with the content of the webpage.' },
			{ name: 'shareaholic:language', description: 'Language of the content of the webpage.' },
			{ name: 'shareaholic:article_published_time', description: '(ISO 8601) - Timestamp for when the content of the webpage was first published.' },
			{ name: 'shareaholic:article_modified_time', description: '(ISO 8601) - Timestamp for when the content on the webpage was last modified.' },
			{ name: 'shareaholic:site_name', description: 'The site name which should be displayed for the overall site.' }
		],
		feature: [
			{ name: 'shareaholic:site_id', description: 'Your Shareaholic API Key / Site ID.' },
			{ name: 'shareaholic:article_visibility', description: 'Exclude from Recommendation Engine.' },
			{ name: 'shareaholic:article_visibility', description: 'Exclude from Recommendation Engine and all Analytics.' },
			{ name: 'shareaholic:shareable_page', description: 'Whether the webpage is shareable.' },
			{ name: 'shareaholic:outstreamads', description: 'Disables Outstream Video Ads.' },
			{ name: 'shareaholic:drupal_version', description: 'Shareaholic for Drupal module version (automatically added by module).' },
			{ name: 'shareaholic:wp_version', description: 'Shareaholic for WordPress plugin version (automatically added by plugin).' }
		]
	};

	return {

		/**
		 * Returns the state whether the given tag name is a known Shareaholic Content tag.
		 * @param {string} tagName The tag name to check whether it is a known Shareaholic Content tag.
		 * @returns State whether the given tag name is a known Shareaholic Content tag.
		 */
		IsShareaholicContentTag: function(tagName) {
			return (tagsShareaholic.content.filter(tag => tag.name === (tagName || '').toString().trim().toLowerCase()).length > 0);
		},

		/**
		 * Returns the state whether the given tag name is a known Shareaholic Feature tag.
		 * @param {string} tagName The tag name to check whether it is a known Shareaholic Feature tag.
		 * @returns State whether the given tag name is a known Shareaholic Feature tag.
		 */
		IsShareaholicFeatureTag: function(tagName) {
			return (tagsShareaholic.feature.filter(tag => tag.name === (tagName || '').toString().trim().toLowerCase()).length > 0);
		},

		/**
		 * Returns the state whether the given tag name is a known Shareaholic tag.
		 * @param {string} tagName The tag name to check whether it is a known Shareaholic tag.
		 * @returns State whether the given tag name is a known Shareaholic tag.
		 */
		IsShareaholicTag: function(tagName) {
			return (this.IsShareaholicContentTag(tagName) || this.IsShareaholicFeatureTag(tagName));
		},

		/**
		 * Returns all found Shareaholic tag of the website.
		 * @returns Returns an object with all found Shareaholic tags of the website.
		 */
		GetShareaholicTags: function() {
			let tagsContent = [];
			let tagsFeature = [];

			//get alle the Shareaholic tags of the website (starting with shareaholic:).
			$('head meta[name^="shareaholic:"]').each(function() {
				const tagName = ($(this).attr('name') || '').toString().trim();

				//check whether the current tag is a known Shareaholic Content tag.
				if (MetaInfo.IsShareaholicContentTag(tagName)) {
					tagsContent.push({
						name: tagName,
						value: ($(this).attr('content') || '').toString().trim()
					});
				} else if (MetaInfo.IsShareaholicFeatureTag(tagName)) {
					tagsFeature.push({
						name: tagName,
						value: ($(this).attr('content') || '').toString().trim()
					});
				}
			});

			//return all found Shareaholic tags.
			return {
				content: tagsContent,
				feature: tagsFeature
			};
		}
	}
})();
