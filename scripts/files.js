/**
 * Module FileInformation
 */
var FileInformation = (function() {
    return {
        GetJavaScriptFiles: function() {
            var info = [];

            $('script[src]').each(function() {

                //get the hyperlink of the javascript.
                var strJavaScriptURL = ($(this).attr('src') || '').toString().trim();
                var urlObject = new URL(strJavaScriptURL, GetBaseUrl());

                info.push({
                    'original': strJavaScriptURL,
                    'url': {
                        'href': urlObject.href,
                        'origin': urlObject.origin
                    },
										'is_async': $(this).attr('async') ? true : false,
										'charset': ($(this).attr('charset') || '').toString().trim()
                });
            });

            return info;
        },
        GetStylesheetFiles: function() {
            var info = [];

            $('link[rel="stylesheet"]').each(function() {

                //get the hyperlink of the stylesheet.
                var strStylesheetURL = ($(this).attr('href') || '').toString().trim();

                //get the url object of the link.
                //this can also be used to make sure the link is a valid url.
                var urlObject = new URL(strStylesheetURL, GetBaseUrl());

                info.push({
                    'original': strStylesheetURL,
                    'url': {
                        'href': urlObject.href,
                        'origin': urlObject.origin
                    },
										'media': ($(this).attr('media') || '').toString()
                });
            });

            return info;
        }
    };
})();
