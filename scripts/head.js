/**
 * sources:
 *  - https://html.spec.whatwg.org/#the-title-element
 */
var arrCommonElements = [
    'title'
];

/**
 * sources:
 *  - https://support.google.com/webmasters/answer/79812
 *  - https://html.spec.whatwg.org/#standard-metadata-names
 *  - https://www.bing.com/webmaster/help/which-robots-metatags-does-bing-support-5198d240
 */
var arrMetaElements = [
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

/**
 * sources:
 *  - https://yoast.com/3-seo-quick-wins/
 */
var arrArticleMetaElements = [
    'article:author',
    'article:publisher',
    'article:modified_time'
];

/**
 * sources:
 *  - https://yoast.com/3-seo-quick-wins/
 */
var arrOpenGraphMetaElements = [
    'og:description',
    'og:image',
    'og:image:height',
    'og:image:width',
    'og:locale',
    'og:site_name',
    'og:title',
    'og:type',
    'og:url'
];

/**
 * sources:
 *  - https://yoast.com/3-seo-quick-wins/
 *  - https://developer.twitter.com/en/docs/tweets/optimize-with-cards/overview/summary-card-with-large-image
 */
var arrTwitterMetaElements = [
    'twitter:card',
    'twitter:creator',
    'twitter:description',
    'twitter:image',
    'twitter:image:alt',
    'twitter:site',
    'twitter:title'
];

/**
 * sources:
 *  - https://www.parse.ly/help/integration/metatags
 */
var arrParselyMetaElements = [
    'parsely-author',
    'parsely-image-url',
    'parsely-link',
    'parsely-pub-date',
    'parsely-section',
    'parsely-tags',
    'parsely-type',
    'parsely-title'
];

/**
 * function to get the information of the <head> element of the page.
 */
function GetInformationMetaTags() {
    var info = new Object();
    
    //iterate through the common <meta> elements of the <head> element.    
    for(var itemMetaElement of arrMetaElements) {
        info[itemMetaElement] = new MetaInfo(itemMetaElement, $('head > meta[name="' + itemMetaElement + '"]').attr('content'));
    }

    //iterate through the common elements of the <head> element.
    for(var itemCommonElement of arrCommonElements) {
        info[itemCommonElement] = new MetaInfo(itemCommonElement, $('head > ' + itemCommonElement).text());
    }

    //iterate through the article <meta> elements of the <head> element.
    for(var itemArticleMetaElement of arrArticleMetaElements) {
        info[itemArticleMetaElement] = new MetaInfo(itemArticleMetaElement, $('head > meta[property="' + itemArticleMetaElement + '"]').attr('content'));
    }

    //iterate through the OpenGraph <meta> elements of the <head> element.
    for(var itemOpenGraphMetaElement of arrOpenGraphMetaElements) {
        info[itemOpenGraphMetaElement] = new MetaInfo(itemOpenGraphMetaElement, $('head > meta[property="' + itemOpenGraphMetaElement + '"]').attr('content'));
    }

    //iterate through the Twitter <meta> elements of the <head> element.
    for(var itemTwitterMetaElement of arrTwitterMetaElements) {
        info[itemTwitterMetaElement] = new MetaInfo(itemTwitterMetaElement, $('head > meta[name="' + itemTwitterMetaElement + '"]').attr('content'));
    }

    //return the object with the meta information.
    return info;
}

/**
 * function to get all property values of the <meta> elements.
 */
function GetAllMetaProperties() {
    var arrMetaProperties = [];

    //get all property attributes of the <meta> elements and add the values to the array.
    $('head > meta[property]').each(function() {
        arrMetaProperties.push($(this).attr('property'));
    });

    //return the array with all found property values of the <meta> elements.
    return arrMetaProperties;
}

/**
 * function to get all name values of the <meta> elements.
 */
function GetAllMetaNames() {
    var arrMetaNames = [];

    //get all name attributes of the <meta> elements and add the values to the array.
    $('head > meta[name]').each(function() {
        arrMetaNames.push($(this).attr('name'));
    });

    //return the array with all found name values of the <meta> elements.
    return arrMetaNames;
}

/**
 * function to get all Parse.ly <meta> elements.
 */
function GetParselyMeta() {
    var info = new Object();

    //iterate through the parsely <meta> elements of the <head> element.
    for (var itemParselyMetaElement of arrParselyMetaElements) {
        info[itemParselyMetaElement] = new MetaInfo(itemParselyMetaElement, $('head > meta[name="' + itemParselyMetaElement + '"]').attr('content'));
    }

    //return the object with the meta information.
    return info;
}

function GetTwitterMeta() {
    var info = new Object();

    //iterate through the Twitter <meta> elements of the <head> element.
    for (var itemTwitterMetaElement of arrTwitterMetaElements) {
        info[itemTwitterMetaElement] = new MetaInfo(itemTwitterMetaElement, $('head > meta[name="' + itemTwitterMetaElement + '"]').attr('content'));
    }

    return info;
}

function GetOpenGraphMeta() {
    var info = new Object();

    //iterate through the OpenGraph <meta> elements of the <head> element.
    for (var itemOpenGraphMetaElement of arrOpenGraphMetaElements) {
        info[itemOpenGraphMetaElement] = new MetaInfo(itemOpenGraphMetaElement, $('head > meta[property="' + itemOpenGraphMetaElement + '"]').attr('content'));
    }

    return info;
}