/**
 * sources:
 *  - https://support.google.com/webmasters/answer/79812
 *  - https://html.spec.whatwg.org/#standard-metadata-names
 */
var arrMetaElements = [
    'application-name',
    'author',
    'description',
    'generator',
    'google',
    'googlebot',
    'google-site-verification',
    'keywords',
    'rating',
    'referrer',
    'robots',
    'theme-color',
    'viewport'
];

/**
 * sources:
 *  - https://html.spec.whatwg.org/#the-title-element
 */
var arrCommonElements = [
    'title'
];

/**
 * function to get the information of the <head> element of the page.
 */
function GetInformationMetaTags() {
    var info = new Object();

    //iterate through the <meta> elements of the <head> element.    
    for(var itemMetaElement of arrMetaElements) {
        info[itemMetaElement] = new MetaInfo(itemMetaElement, $('meta[name="' + itemMetaElement + '"]').attr('content'));
    }

    //iterate through the common elements of the <head> element.
    for(var itemCommonElement of arrCommonElements) {
        info[itemCommonElement] = new MetaInfo(itemCommonElement, $('head > ' + itemCommonElement).text());
    }

    //return the object with the meta information.accent-1
    return info;
}