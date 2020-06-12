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
 * function to get the information of the <head> element of the page.
 */
function GetInformationMetaTags() {
    var info = new Object();

    //iterate through all the common <meta> elements with name attribute.
    $('head > meta[name]').each(function() {

        //normalize the name of the <meta> element.
        var strMetaName = $(this).attr('name').trim().toLowerCase();

        //add the meta information to the object if the name is known.
        if (arrMetaElements.includes(strMetaName)) {
            info[strMetaName] = {
                'name': strMetaName,
                'value': GetString($(this).attr('content'))
            };
        }
    });

    //iterate through the common elements of the <head> element.
    for(var itemCommonElement of arrCommonElements) {
        info[itemCommonElement] = {
            'name': itemCommonElement,
            'value': GetString($('head > ' + itemCommonElement).text())
        };
    }

    $.extend(info, MetaInformation.GetOpenGraph());
    $.extend(info, MetaInformation.GetParsely());
    $.extend(info, MetaInformation.GetTwitter());
    $.extend(info, MetaInformation.GetArticle());
    
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
 * Module MetaInformation
 */
var MetaInformation = (function() {

    /**
     * The known properties for the Article meta information.
     * 
     * sources:
     *  - https://yoast.com/3-seo-quick-wins/
     */
    var arrMetaPropertiesArticle = [
        'article:author',
        'article:publisher',
        'article:modified_time'
    ];

    /**
     * The known properties for the OpenGraph meta information.
     * 
     * sources:
     *  - https://yoast.com/3-seo-quick-wins/
     */
    var arrMetaPropertiesOpenGraph = [
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
     * The known names for the Parse.ly meta information.
     * 
     * sources:
     *  - https://www.parse.ly/help/integration/metatags
     */
    var arrMetaNamesParsely = [
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
     * The known names for the Twitter meta information.
     * 
     * sources:
     *  - https://yoast.com/3-seo-quick-wins/
     *  - https://developer.twitter.com/en/docs/tweets/optimize-with-cards/overview/summary-card-with-large-image
     */
    var arrMetaNamesTwitter = [
        'twitter:card',
        'twitter:creator',
        'twitter:description',
        'twitter:image',
        'twitter:image:alt',
        'twitter:site',
        'twitter:title'
    ];

    return {

        /**
         * Get the Article meta information.
         */
        GetArticle: function() {
            var info = new Object();

            //iterate through the Article <meta> elements of the <head> element.
            $('head > meta[property^="article:"]').each(function() {
                var strMetaName = $(this).attr('property').trim();

                //add the meta information if known.
                if (arrMetaPropertiesArticle.includes(strMetaName)) {
                    info[strMetaName] = {
                        'name': strMetaName,
                        'value': GetString($(this).attr('content'))
                    };
                }
            });

            //return the information.
            return info;
        },

        /**
         * Get the OpenGraph meta information.
         */
        GetOpenGraph: function() {
            var info = new Object();

            //iterate through the OpenGraph <meta> elements of the <head> element.
            $('head > meta[property^="og:"]').each(function() {
                var strMetaName = $(this).attr('property').trim();

                //add the meta information if known.
                if (arrMetaPropertiesOpenGraph.includes(strMetaName)) {
                    info[strMetaName] = {
                        'name': strMetaName,
                        'value': GetString($(this).attr('content'))
                    };
                }
            });

            //return the information.
            return info;
        },

        /**
         * Get the Parse.ly meta information.
         */
        GetParsely: function() {
            var info = new Object();

            //iterate through the Parse.ly <meta> elements of the <head> element.
            $('head > meta[name^="parsely-"]').each(function() {
                var strMetaName = $(this).attr('name').trim();

                //add the meta information if known.
                if (arrMetaNamesParsely.includes(strMetaName)) {
                    info[strMetaName] = {
                        'name': strMetaName,
                        'value': GetString($(this).attr('content'))
                    };
                }
            });

            //return the information.
            return info;
        },

        /**
         * Get the Twitter meta information.
         */
        GetTwitter: function() {
            var info = new Object();

            //iterate through the Twitter <meta> elements of the <head> element.
            $('head > meta[name^="twitter:"]').each(function() {
                var strMetaName = $(this).attr('name').trim();

                //add the meta information if known.
                if (arrMetaNamesTwitter.includes(strMetaName)) {
                    info[strMetaName] = {
                        'name': strMetaName,
                        'value': GetString($(this).attr('content'))
                    };
                }
            });

            //return the information.
            return info;
        }
    }
})();