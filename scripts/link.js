/**
 * Module for Links / Hyperlinks.
 */
var LinkModule = (function() {
    
    //private functions of the module.

    /**
     * function to get the base url of the current site.
     * @returns {string} The base url of the current site.
     */
    function GetBaseUrl() {
        return (location.origin + location.pathname);
    }

    /**
     * function to get all links of a document / site.
     * @param {Document} context The optional document used as context for jQuery. 
     * @returns {Object[]} An object array with the basic information of the links.
     */
    function GetLinksOfDocument(context = undefined) {
        let arrLinks = [];

        //iterate through all link elements of the site.
        $('a', context).each(function() {
            try {

                //get the url of the link element.
                let strUrl = ($(this).attr('href') || '').toString().trim();
                
                //get the url object of the link.
                //this can also be used to make sure the link is a vlid url.
                let objLinkUrl = new URL(strUrl, GetBaseUrl());

                //all links are collected in an array once.
                //so try to find the current link in the array to update the count.
                let linkUrlAvailable = arrLinks.find(itemUrl => itemUrl.url.href === objLinkUrl.href);

                //check if the link is available on the array.
                if (linkUrlAvailable) {
                    linkUrlAvailable.count++;
                    return;
                }

                //add the information of the link as object to the array.
                arrLinks.push({
                    'count': 1,
                    'internal': IsInternal(objLinkUrl.href),
                    'rel': ($(this).attr('rel') || '').toString().trim(),
                    'title': ($(this).attr('title') || '').toString().trim(),
                    'url': {
                        'hash': (objLinkUrl.hash || '').toString().trim(),
                        'href': (objLinkUrl.href || '').toString().trim(),
                        'origin': (objLinkUrl.origin || '').toString().trim(),
                        'path': (objLinkUrl.pathname || '').toString().trim(),
                        'protocol': (objLinkUrl.protocol || '').toString().trim().replace(':', '')
                    }
                });
            } catch(_) { }      
        });

        //return the found links.
        return arrLinks;
    }

    /**
     * function to check if a url is an internal url.
     * @param {string} url The url to be checked.
     * @returns {boolean} The state if the url is an internal url.
     */
    function IsInternal(url) {
        return url.startsWith(location.origin);
    }

    //public functions of the module.
    return {

        /**
         * function to get all links of the current site.
         * @returns {Object[]} An object array with basic information of the links.
         */
        GetLinks: function() {
            let arrLinks = [];

            //iterate through the frames of the site to get the links of the available frames.
            for (let frameIndex = 0; frameIndex < window.frames.length; frameIndex++) {
                
                //there are also blocked frames so we have to try to get the document of the frame.
                try {
                    arrLinks = arrLinks.concat(GetLinksOfDocument(window.frames[frameIndex].document));
                } catch(_) { }
            }

            //get all links outside of frames.
            arrLinks = arrLinks.concat(GetLinksOfDocument());

            //return all the found links of the site.
            return arrLinks;
        }
    }
  })();