/**
 * Module MetaInformation
 */
var FileInformation = (function() {
    return {
        GetJavaScriptFiles: function() {
            var info = [];

            $('script[src]').each(function() {
                info.push($(this).attr('src'));
            });

            return info;
        },
        GetStylesheetFiles: function() {
            var info = [];

            $('link[rel="stylesheet"]').each(function() {
                info.push($(this).attr('href'));
            });

            return info;
        }
    };
})();