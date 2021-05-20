/**
 * Module for Open Graph tags.
 */
var OpenGraph = (function() {

  /**
   * Returns the name of the Open Graph element.
   * @param {object} html HTML element to get the name of the Open Graph element.
   * @returns {string|null} Name of the Open Graph element.
   */
  function GetName(html) {
    if ($(html).is('[property]')) {
      return $(html).attr('property').trim().toLowerCase();
    } else if ($(html).is('[name]')) {
      return $(html).attr('name').trim().toLowerCase();
    } else {
      return null;
    }
  };

  /**
   * Returns all Open Graph properties of a given group.
   * @param {string} group The Open Graph group to get the properties of these group.
   * @returns {object[]} An array with all found Open Graph properties of the given group.
   */
  function GetOpenGraphProperties(group) {
    let tags = [];

    //check for a valid Open Graph group.
    if (['basic', 'article', 'audio', 'book', 'image', 'profile', 'video'].indexOf(group) === -1) {
      return [];
    }

    //convert the group into a property name beginning to get the properties from website.
    let nameStart = String(group).replace(/(basic|article|audio|book|image|profile|video)/g, function(s) {
      return {
        "basic": "og:",
        "article": "article:",
        "audio": "og:audio",
        "book": "book:",
        "image": "og:image",
        "profile": "profile:",
        "video": "og:video"
      }[s];
    });

    //get all Open Graph properties of the group from the website.
    $(`head > meta[property^="${nameStart}"], head > meta[name^="${nameStart}"]`).each(function() {
      const name = GetName(this);

      //don't add the found property to the array if the property name is not known.
      if (OpenGraphTags.filter(tag => tag.group === group).findIndex(tag => tag.name === name) === -1) {
        return;
      }

      //add the Open Graph property to the array.
      tags.push({name: name, value: ($(this).attr('content') || '').toString()});
    });

    //return all found Open Graph properties of the given group.
    return tags;
  }

  const OpenGraphTags = [

    //Open Graph basic properties.
    { name: 'og:description', description: 'A one to two sentence description of your object.', group: 'basic' },
    { name: 'og:determiner', description: 'The word to precede the object\'s title in a sentence.', group: 'basic' },
		{ name: 'og:ignore_canonical', description: '', group: 'basic'},
    { name: 'og:locale', description: 'A Unix locale in which this markup is rendered.', group: 'basic' },
    { name: 'og:site_name', description: 'If your object is part of a larger web site, the name which should be displayed for the overall site.', group: 'basic' },
    { name: 'og:title', description: 'The title of the object as it should appear within the graph.', group: 'basic' },
    { name: 'og:type', description: 'The type of your object, e.g., "movie".  Depending on the type you specify, other properties may also be required.', group: 'basic' },
		{ name: 'og:updated_time', description: '', group: 'basic' },
    { name: 'og:url', description: 'The canonical URL of your object that will be used as its permanent ID in the graph.', group: 'basic' },

    //Open Graph audio properties.
    { name: 'og:audio', description: 'A relevant audio URL for your object.', group: 'audio' },
    { name: 'og:audio:secure_url', description: 'A relevant, secure audio URL for your object.', group: 'audio' },
    { name: 'og:audio:type', description: 'The mime type of an audio file.', group: 'audio' },

    //Open Graph image properties.
    { name: 'og:image', description: 'An image URL which should represent your object within the graph.', group: 'image' },
    { name: 'og:image:alt', description: 'A description of what is in the image (not a caption).', group: 'image' },
    { name: 'og:image:height', description: 'The height of an image.', group: 'image' },
    { name: 'og:image:secure_url', description: 'A secure image URL which should represent your object within the graph.', group: 'image' },
    { name: 'og:image:type', description: 'The mime type of an image.', group: 'image' },
    { name: 'og:image:url', description: 'An image URL which should represent your object within the graph.', group: 'image' },
    { name: 'og:image:width', description: 'The width of an image.', group: 'image' },

    //Open Graph video properties.
    { name: 'og:video', description: 'A relevant video URL for your object.', group: 'video' },
    { name: 'og:video:height', description: 'The height of a video.', group: 'video' },
    { name: 'og:video:secure_url', description: 'A relevant, secure video URL for your object.', group: 'video' },
    { name: 'og:video:type', description: 'The mime type of a video.', group: 'video' },
    { name: 'og:video:width', description: 'The width of a video.', group: 'video' },

    //Open Graph article properties.
    { name: 'article:author', description: 'Writers of the article.', group: 'article' },
    { name: 'article:expiration_time', description: 'When the article is out of date after.', group: 'article' },
    { name: 'article:modified_time', description: 'When the article was last changed.', group: 'article' },
		{ name: 'article:publisher', description: '', group: 'article' },
    { name: 'article:published_time', description: 'When the article was first published.', group: 'article' },
    { name: 'article:section', description: 'A high-level section name.', group: 'article' },
    { name: 'article:tag', description: 'Tag words associated with this article.', group: 'article' },

    //Open Graph book properties.
    { name: 'book:author', description: 'Who wrote this book.', group: 'book' },
    { name: 'book:isbn', description: 'The ISBN.', group: 'book' },
    { name: 'book:release_date', description: 'The date the book was released.', group: 'book' },
    { name: 'book:tag', description: 'Tag words associated with this book.', group: 'book' },

    //Open Graph profile properties.
    { name: 'profile:first_name', description: 'A name normally given to an individual by a parent or self-chosen.', group: 'profile' },
    { name: 'profile:last_name', description: 'A name inherited from a family or marriage and by which the individual is commonly known.', group: 'profile' },
    { name: 'profile:username', description: 'A short unique string to identify them.', group: 'profile' },
    { name: 'profile:gender', description: 'Their gender.', group: 'profile' }
  ];

  return {

    /**
     * Returns all found article properties on the website.
     * @returns {object[]} An array with all found article properties on the website.
     */
    GetArticleProperties: function() {
      return GetOpenGraphProperties('article');
    },

    /**
     * Returns all found audio properties on the website.
     * @returns {object[]} An array with all found audio properties on the website.
     */
    GetAudioProperties: function() {
      return GetOpenGraphProperties('audio');
    },

    /**
     * Returns all found basic properties on the website.
     * @returns {object[]} An array with all found basic properties on the website.
     */
    GetBasicProperties: function() {
      return GetOpenGraphProperties('basic');
    },

    /**
     * Returns all found book properties on the website.
     * @returns {object[]} An array with all found basic properties on the website.
     */
    GetBookProperties: function() {
      return GetOpenGraphProperties('book');
    },

    /**
     * Returns all found image properties on the website.
     * @returns {object[]} An array with all found image properties on the website.
     */
    GetImageProperties: function() {
      return GetOpenGraphProperties('image');
    },

    /**
     * Returns all found profile properties on the website.
     * @returns {object[]} An array with all found profile properties on the website.
     */
    GetProfileProperties: function() {
      return GetOpenGraphProperties('profile');
    },

    /**
     * Returns all found video properties on the website.
     * @returns {object[]} An array with all found video properties on the website.
     */
    GetVideoProperties: function() {
      return GetOpenGraphProperties('video');
    },

    /**
     * Returns all Open Graph tag information of the basic properties.
     * @returns {object[]} An array with all Open Graph tag information of the basic properties.
     */
    GetBasicTagsInfo: function() {
      return OpenGraphTags.filter(tag => tag.group === 'basic');
    },

    /**
     * Returns all Open Graph tag information of the article properties.
     * @returns {object[]} An array with all Open Graph tag information of the article properties.
     */
    GetArticleTagsInfo: function() {
      return OpenGraphTags.filter(tag => tag.group === 'article');
    },

    /**
     * Returns all Open Graph tag information of the audio properties.
     * @returns {object[]} An array with all Open Graph tag information of the audio properties.
     */
    GetAudioTagsInfo: function() {
      return OpenGraphTags.filter(tag => tag.group === 'audio');
    },

    /**
     * Returns all Open Graph tag information of the book properties.
     * @returns {object[]} An array with all Open Graph tag information of the book properties.
     */
    GetBookTagsInfo: function() {
      return OpenGraphTags.filter(tag => tag.group === 'book');
    },

    /**
     * Returns all Open Graph tag information of the image properties.
     * @returns {object[]} An array with all Open Graph tag information of the image properties.
     */
    GetImageTagsInfo: function() {
      return OpenGraphTags.filter(tag => tag.group === 'image');
    },

    /**
     * Returns all Open Graph tag information of the profile properties.
     * @returns {object[]} An array with all Open Graph tag information of the profile properties.
     */
    GetProfileTagsInfo: function() {
      return OpenGraphTags.filter(tag => tag.group === 'profile');
    },

    /**
     * Returns all Open Graph tag information of the video properties.
     * @returns {object[]} An array with all Open Graph tag information of the video properties.
     */
    GetVideoTagsInfo: function() {
      return OpenGraphTags.filter(tag => tag.group === 'video');
    },

		/**
		 * Returns the state whether a meta name is a Open Graph meta tag.
		 * @param {string} name The meta name to check for Open Graph meta tag.
		 * @returns {boolean} The state if the meta name is a Open Graph meta tag.
		 */
		IsOpenGraphTag: function(name) {
			const isOpenGraphArticle = OpenGraph.GetArticleTagsInfo().findIndex(tag => tag.name === name) > -1;
			const isOpenGraphAudio = OpenGraph.GetAudioTagsInfo().findIndex(tag => tag.name === name) > -1;
			const isOpenGraphBasic = OpenGraph.GetBasicTagsInfo().findIndex(tag => tag.name === name) > -1;
			const isOpenGraphBook = OpenGraph.GetBookTagsInfo().findIndex(tag => tag.name === name) > -1;
			const isOpenGraphImage = OpenGraph.GetImageTagsInfo().findIndex(tag => tag.name === name) > -1;
			const isOpenGraphProfile = OpenGraph.GetProfileTagsInfo().findIndex(tag => tag.name === name) > -1;
			const isOpenGraphVideo = OpenGraph.GetVideoTagsInfo().findIndex(tag => tag.name === name) > -1;
			return isOpenGraphArticle || isOpenGraphAudio || isOpenGraphBasic || isOpenGraphBook || isOpenGraphImage || isOpenGraphProfile || isOpenGraphVideo;
		}
  };
})();
