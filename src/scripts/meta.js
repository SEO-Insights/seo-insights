// create the namespace of SEO Insights if the namespace doesn't exist.
var SEOInsights = (SEOInsights || {});

/**
 * The Meta class of SEO Insights to get information of Meta used on a website.
 */
SEOInsights.Meta = class Meta {

	/**
	 * Returns a object with information of Open Graph tags.
	 * @returns {object} An object with information of Open Graph tags.
	 * @see https://ogp.me/
	 */
	static TagsOpenGraph() {
		return {
			article: [
				{ name: 'article:author', description: 'Writers of the article.' },
				{ name: 'article:expiration_time', description: 'When the article is out of date after.' },
				{ name: 'article:modified_time', description: 'When the article was last changed.' },
				{ name: 'article:publisher', description: '' },
				{ name: 'article:published_time', description: 'When the article was first published.' },
				{ name: 'article:section', description: 'A high-level section name.' },
				{ name: 'article:tag', description: 'Tag words associated with this article.' }
			],
			audio: [
				{ name: 'og:audio', description: 'A relevant audio URL for your object.' },
				{ name: 'og:audio:secure_url', description: 'A relevant, secure audio URL for your object.' },
				{ name: 'og:audio:type', description: 'The mime type of an audio file.' }
			],
			basic: [
				{ name: 'og:description', description: 'A one to two sentence description of your object.' },
				{ name: 'og:determiner', description: 'The word to precede the object\'s title in a sentence.' },
				{ name: 'og:ignore_canonical', description: '' },
				{ name: 'og:locale', description: 'A Unix locale in which this markup is rendered.' },
				{ name: 'og:locate:alternate', description: '' },
				{ name: 'og:site_name', description: 'If your object is part of a larger web site, the name which should be displayed for the overall site.' },
				{ name: 'og:title', description: 'The title of the object as it should appear within the graph.' },
				{ name: 'og:type', description: 'The type of your object, e.g., "movie".  Depending on the type you specify, other properties may also be required.' },
				{ name: 'og:updated_time', description: '' },
				{ name: 'og:url', description: 'The canonical URL of your object that will be used as its permanent ID in the graph.' }
			],
			book: [
				{ name: 'book:author', description: 'Who wrote this book.' },
				{ name: 'book:isbn', description: 'The ISBN.' },
				{ name: 'book:release_date', description: 'The date the book was released.' },
				{ name: 'book:tag', description: 'Tag words associated with this book.' }
			],
			image: [
				{ name: 'og:image', description: 'An image URL which should represent your object within the graph.' },
				{ name: 'og:image:alt', description: 'A description of what is in the image (not a caption).' },
				{ name: 'og:image:height', description: 'The height of an image.' },
				{ name: 'og:image:secure_url', description: 'A secure image URL which should represent your object within the graph.' },
				{ name: 'og:image:type', description: 'The mime type of an image.' },
				{ name: 'og:image:url', description: 'An image URL which should represent your object within the graph.' },
				{ name: 'og:image:width', description: 'The width of an image.' }
			],
			profile: [
				{ name: 'profile:first_name', description: 'A name normally given to an individual by a parent or self-chosen.' },
				{ name: 'profile:last_name', description: 'A name inherited from a family or marriage and by which the individual is commonly known.' },
				{ name: 'profile:username', description: 'A short unique string to identify them.' },
				{ name: 'profile:gender', description: 'Their gender.' }
			],
			video: [
				{ name: 'og:video', description: 'A relevant video URL for your object.' },
				{ name: 'og:video:height', description: 'The height of a video.' },
				{ name: 'og:video:secure_url', description: 'A relevant, secure video URL for your object.' },
				{ name: 'og:video:type', description: 'The mime type of a video.' },
				{ name: 'og:video:width', description: 'The width of a video.' }
			]
		};
	}

	/**
	 * Returns a object with information of Shareaholic tags.
	 * @returns {object} An object with information of Shareaholic tags.
	 * @see https://github.com/shareaholic/shareaholic-api-docs/blob/master/shareaholic_meta_tags.md
	 */
	static TagsShareaholic() {
		return {
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
	}

	/**
	 * Returns the state whether the given tag name is a Dublin Core tag.
	 * @param {string} tagName The tag name to check whether it is a Dublin Core tag.
	 * @returns {boolean} State whether the given tag name is a Dublin Core tag.
	 */
	static IsDublinCoreTag(tagName) {
		tagName = (tagName || '').toString().trim().toUpperCase();
		return (tagName.startsWith('DC.') || tagName.startsWith('DCTERMS.'));
	}

	/**
	 * Returns the state whether the given tag name is a known Open Graph Article tag.
	 * @param {string} tagName The tag name to check whether it is a known Open Graph Article tag.
	 * @returns {boolean} State whether the given tag name is a known Open Graph Article tag.
	 */
	static IsOpenGraphArticleTag(tagName) {
		return (SEOInsights.Meta.TagsOpenGraph().article.filter(tag => tag.name === (tagName || '').toString().trim().toLowerCase()).length > 0);
	}

	/**
	 * Returns the state whether the given tag name is a known Open Graph Audio tag.
	 * @param {string} tagName The tag name to check whether it is a known Open Graph Audio tag.
	 * @returns {boolean} State whether the given tag name is a known Open Graph Audio tag.
	 */
	static IsOpenGraphAudioTag(tagName) {
		return (SEOInsights.Meta.TagsOpenGraph().audio.filter(tag => tag.name === (tagName || '').toString().trim().toLowerCase()).length > 0);
	}

	/**
	 * Returns the state whether the given tag name is a known Open Graph Basic tag.
	 * @param {string} tagName The tag name to check whether it is a known Open Graph Basic tag.
	 * @returns {boolean} State whether the given tag name is known Open Graph Basic tag.
	 */
	static IsOpenGraphBasicTag(tagName) {
		return (SEOInsights.Meta.TagsOpenGraph().basic.filter(tag => tag.name === (tagName || '').toString().trim().toLowerCase()).length > 0);
	}

	/**
	 * Returns the state whether the given tag name is a known Open Graph Book tag.
	 * @param {string} tagName The tag name to check whether it is a known Open Graph Book tag.
	 * @returns {boolean} State whether the given tag name is a known Open Graph Book tag.
	 */
	static IsOpenGraphBookTag(tagName) {
		return (SEOInsights.Meta.TagsOpenGraph().book.filter(tag => tag.name === (tagName || '').toString().trim().toLowerCase()).length > 0);
	}

	/**
	 * Returns the state whether the given tag name is a known Open Graph Image tag.
	 * @param {string} tagName The tag name to check whether it is a known Open Graph Image tag.
	 * @returns {boolean} State whether the given tag name is a known Open Graph Image tag.
	 */
	static IsOpenGraphImageTag(tagName) {
		return (SEOInsights.Meta.TagsOpenGraph().image.filter(tag => tag.name === (tagName || '').toString().trim().toLowerCase()).length > 0);
	}

	/**
	 * Returns the state whether the given tag name is a known Open Graph Profile tag.
	 * @param {string} tagName The tag name to check whether it is a known Open Graph Profile tag.
	 * @returns {boolean} State whether the given tag name is a known Open Graph Profile tag.
	 */
	static IsOpenGraphProfileTag(tagName) {
		return (SEOInsights.Meta.TagsOpenGraph().profile.filter(tag => tag.name === (tagName || '').toString().trim().toLowerCase()).length > 0);
	}

	/**
	 * Returns the state whether the given tag name is a known Open Graph Video tag.
	 * @param {string} tagName The tag name to check whether it is a known Open Graph Video tag.
	 * @returns {boolean} State whether the given tag name is a known Open Graph Video tag.
	 */
	static IsOpenGraphVideoTag(tagName) {
		return (SEOInsights.Meta.TagsOpenGraph().video.filter(tag => tag.name === (tagName || '').toString().trim().toLowerCase()).length > 0);
	}

	/**
	 * Returns the state whether the given tag name is a known Open Graph tag.
	 * @param {string} tagName The tag name to check whether it is a known Open Graph tag.
	 * @returns {boolean} State whether the given tag name is a known Open Graph tag.
	 */
	static IsOpenGraphTag(tagName) {
		return (SEOInsights.Meta.IsOpenGraphArticleTag(tagName) ||
			SEOInsights.Meta.IsOpenGraphAudioTag(tagName) ||
			SEOInsights.Meta.IsOpenGraphBasicTag(tagName) ||
			SEOInsights.Meta.IsOpenGraphBookTag(tagName) ||
			SEOInsights.Meta.IsOpenGraphImageTag(tagName) ||
			SEOInsights.Meta.IsOpenGraphProfileTag(tagName) ||
			SEOInsights.Meta.IsOpenGraphVideoTag(tagName));
	}

	/**
	 * Returns the state whether the given tag name is a known Parse.ly tag.
	 * @param {string} tagName The tag name to check whether it is a Parse.ly tag.
	 * @returns {boolean} State whether the given tag name is a Parse.ly tag.
	 */
	static IsParselyTag(tagName) {
		return (tagName || '').toString().trim().toLowerCase().startsWith('parsely-');
	}

	/**
	 * Returns the state whether the given tag name is a known Shareaholic Content tag.
	 * @param {string} tagName The tag name to check whether it is a known Shareaholic Content tag.
	 * @returns {boolean} State whether the given tag name is a known Shareaholic Content tag.
	 */
	static IsShareaholicContentTag(tagName) {
		return (SEOInsights.Meta.TagsShareaholic().content.filter(tag => tag.name === (tagName || '').toString().trim().toLowerCase()).length > 0);
	}

	/**
	 * Returns the state whether the given tag name is a known Shareaholic Feature tag.
	 * @param {string} tagName The tag name to check whether it is a known Shareaholic Feature tag.
	 * @returns {boolean} State whether the given tag name is a known Shareaholic Feature tag.
	 */
	static IsShareaholicFeatureTag(tagName) {
		return (SEOInsights.Meta.TagsShareaholic().feature.filter(tag => tag.name === (tagName || '').toString().trim().toLowerCase()).length > 0);
	}

	/**
	 * Returns the state whether the given tag name is a known Shareaholic tag.
	 * @param {string} tagName The tag name to check whether it is a known Shareaholic tag.
	 * @returns {boolean} State whether the given tag name is a known Shareaholic tag.
	 */
	static IsShareaholicTag(tagName) {
		return (SEOInsights.Meta.IsShareaholicContentTag(tagName) || SEOInsights.Meta.IsShareaholicFeatureTag(tagName));
	}

	/**
	 * Returns the state whether the given tag name is a known Twitter tag.
	 * @param {string} tagName The tag name to check whether it is a known Twitter tag.
	 * @returns {boolean} State whether the given tag name is a known Twitter tag.
	 */
	static IsTwitterTag(tagName) {
		return (tagName || '').toString().trim().toLowerCase().startsWith('twitter:');
	}

	/**
	 * Returns all found Dublin Core tags of the website.
	 * @returns {Array<object>} An array with all found Dublin Core tags of the website.
	 */
	static GetDublineCoreTags() {
		let tagsDublinCore = [];

		// get all the Dublin Core meta tags from <head>.
		$('head meta[name^="DC."], head meta[name^="DCTERMS."], head meta[property^="DC."], head meta[property^="DCTERMS."]').each(function() {
			tagsDublinCore.push({
				name: (GetName(this) || '').toString().trim(),
				value: ($(this).attr('content') || '').toString().trim()
			});
		});

		// return all found Dublin Core tags.
		return tagsDublinCore;
	}

	/**
	 * Returns all found Open Graph tags of the website.
	 * @returns {Array<object>} An array with all found Open Graph tags of the website.
	 */
	static GetOpenGraphTags() {
		let tagsArticle = [];
		let tagsAudio = [];
		let tagsBasic = [];
		let tagsBook = [];
		let tagsImage = [];
		let tagsProfile = [];
		let tagsVideo = [];

		/**
		 * There are different groups on the Open Graph tags. They are starting as described in this list:
		 *
		 * - article: "article:"
		 * - audio: "og:audio"
		 * - basic: "og:"
		 * - book: "book:"
		 * - image: "og:image"
		 * - profile: "profile:"
		 * - video: "og:video"
		 *
		 * It is possible to get all Open Graph tags with the following start values on name or property attribute:
		 *
		 * - "artcile:"
		 * - "og:"
		 * - "book:"
		 * - "profile:"
		 */

		// get all the Open Graph tags of the website (using the name attribute on meta element).
		$('head meta[name^="og:"], head meta[name^="article:"], head meta[name^="book:"], head meta[name^="profile:"], head meta[property^="og:"], head meta[property^="article:"], head meta[property^="book:"], head meta[property^="profile:"]').each(function() {
			const tagName = (GetName(this) || '').toString().trim();

			// check the tag name to set the information to the correct array.
			if (SEOInsights.Meta.IsOpenGraphArticleTag(tagName)) {
				tagsArticle.push({ name: tagName, value: ($(this).attr('content') || '').toString().trim() });
			} else if (SEOInsights.Meta.IsOpenGraphAudioTag(tagName)) {
				tagsAudio.push({ name: tagName, value: ($(this).attr('content') || '').toString().trim() });
			} else if (SEOInsights.Meta.IsOpenGraphBasicTag(tagName)) {
				tagsBasic.push({ name: tagName, value: ($(this).attr('content') || '').toString().trim() });
			} else if (SEOInsights.Meta.IsOpenGraphBookTag(tagName)) {
				tagsBook.push({ name: tagName, value: ($(this).attr('content') || '').toString().trim() });
			} else if (SEOInsights.Meta.IsOpenGraphImageTag(tagName)) {
				tagsImage.push({ name: tagName, value: ($(this).attr('content') || '').toString().trim() });
			} else if (SEOInsights.Meta.IsOpenGraphProfileTag(tagName)) {
				tagsProfile.push({ name: tagName, value: ($(this).attr('content') || '').toString().trim() });
			} else if (SEOInsights.Meta.IsOpenGraphVideoTag(tagName)) {
				tagsVideo.push({ name: tagName, value: ($(this).attr('content') || '').toString().trim() });
			}
		});

		// return all found Open Graph tags.
		return {
			article: tagsArticle,
			audio: tagsAudio,
			basic: tagsBasic,
			book: tagsBook,
			image: tagsImage,
			profile: tagsProfile,
			video: tagsVideo
		};
	}

	/**
	 * Returns all found Parse.ly tags of the website.
	 * @returns {Array<object>} An array with all found Parse.ly tags of the website.
	 */
	static GetParselyTags() {
		let tagsParsely = [];

		// get all the Parse.ly tags of the website (starting with Parsely-).
		$('head meta[name^="Parsely-"], head meta[property^="Parsely-"]').each(function() {
			tagsParsely.push({
				name: (GetName(this) || '').toString().trim(),
				value: ($(this).attr('content') || '').toString().trim()
			});
		});

		// return all found Parse.ly tags.
		return tagsParsely;
	}

	/**
	 * Returns all found Shareaholic tags of the website.
	 * @returns {Array<object>} An array with all found Shareaholic tags of the website.
	 */
	static GetShareaholicTags() {
		let tagsContent = [];
		let tagsFeature = [];

		// get all the Shareaholic tags of the website (starting with shareaholic:).
		$('head meta[name^="shareaholic:"]').each(function() {
			const tagName = ($(this).attr('name') || '').toString().trim();

			// check whether the current tag is a known Shareaholic Content tag.
			if (SEOInsights.Meta.IsShareaholicContentTag(tagName)) {
				tagsContent.push({
					name: tagName,
					value: ($(this).attr('content') || '').toString().trim()
				});
			} else if (SEOInsights.Meta.IsShareaholicFeatureTag(tagName)) {
				tagsFeature.push({
					name: tagName,
					value: ($(this).attr('content') || '').toString().trim()
				});
			}
		});

		// return all found Shareaholic tags.
		return {
			content: tagsContent,
			feature: tagsFeature
		};
	}

	/**
	 * Returns all found Twitter tags of the website.
	 * @returns {Array<object>} An array with all found Twitter tags of the website.
	 */
	static GetTwitterTags() {
		let tagsTwitter = [];

		// get all the Twitter tags of the website (starting with twitter:).
		$('head meta[name^="twitter:"], head meta[property^="twitter:"]').each(function() {
			tagsTwitter.push({
				name: (GetName(this) || '').toString().trim(),
				value: ($(this).attr('content') || '').toString().trim()
			});
		});

		// return all found Twitter tags.
		return tagsTwitter;
	}
};
