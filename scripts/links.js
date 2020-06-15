/**
 * Module for Hyperlinks.
 */
var Hyperlinks = (function() {
    return {
        /**
         * Function to get all hyperlinks of the current site.
         * 
         * @return {Object[]} An array with all found hyperlinks information.
         */
        GetAll: function() {
            var listHyperlinks = [];

            //iterate through all hyperlink elements of the site.
            $('body a').each(function() {
                try {
                    //get the URL as object if reference is valid.
                    //in case the reference is not valid we ignore the hyperlink element.
                    const objUrl = new URL(($(this).attr('href') || '').toString(), Hyperlinks.GetBaseURL());

                    //check if the URL already exists in the array.
                    var objAvailableURL = listHyperlinks.find(objItemURL => objItemURL.url.href === objUrl.href);

                    //add the hyperlink if not exists or update count of this hyperlink.
                    if (objAvailableURL === undefined) {
                        var strHyperlink = objUrl.href;

                        //remove the whole base URL (but only if the base url is not set as hyperlink value).
                        if (strHyperlink !== Hyperlinks.GetBaseURL()) {
                            strHyperlink = strHyperlink.replace(Hyperlinks.GetBaseURL(), '');
                        }

                        //remove the origin of the URL (but only if the origin is not set as hyperlink value).
                        if (strHyperlink !== location.origin) {
                            strHyperlink = strHyperlink.replace(location.origin, '');
                        }

                        //add the object with information of the Hyperlink to the array.
                        listHyperlinks.push({
                            'count': 1,
                            'internal': Hyperlinks.IsInternal(objUrl.href),
                            'rel': ($(this).attr('rel') || '').toString(),
                            'title': ($(this).attr('title') || '').toString(),
                            'url': {
                                'hash': objUrl.hash,
                                'href': objUrl.href,
                                'origin': objUrl.origin,
                                'pathname': objUrl.pathname,
                                'protocol': (objUrl.protocol || '').toString().replace(':', '')
                            },
                            'value': strHyperlink
                        });
                    } else {
                        objAvailableURL.count++;
                    }
                } catch(_) { }
            });

            //return all found hyperlinks.
            return listHyperlinks;
        },

        /**
         * Function to get the base URL of the current site.
         * 
         * @return {string} The base URL of the current site.
         */
        GetBaseURL: function() {
            return (location.origin + location.pathname);
        },

        /**
         * Function to get all external hyperlinks of the current site.
         * 
         * @return {Object[]} An array with all found external hyperlinks.
         */
        GetExternal: function() {
            return Hyperlinks.GetAll().filter(objLink => objLink.internal === false);
        },

        /**
         * Function to get all internal hyperlinks of the current site.
         * 
         * @return {Object[]} An array with all found internal hyperlinks.
         */
        GetInternal: function() {
            return Hyperlinks.GetAll().filter(objLink => objLink.internal === true);
        },

        /**
         * Funtion to check if a full URL is a internal URL.
         * 
         * @param {string} strFullURL The full URL to check if it is a internal URL.
         * @return {boolean} The state if the full URL is a internal URL.
         */
        IsInternal: function(strFullURL) {
            return strFullURL.startsWith(Hyperlinks.GetBaseURL());
        }
    };
})();