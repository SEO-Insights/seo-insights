/**
 * Module for Image Information.
 */
var ImageInformation = (function() {
    return {

        /**
         * Function to get all images of the site.
         * 
         * @return {Object[]} An array with all found images of the site.
         */
        GetImages: function() {
            var listImages = [];

            //iterate through all image elements of the site.
            $('body img').each(function() {
                listImages.push({
                    'alt': ($(this).attr('alt') || '').toString().trim(),
                    'src': ($(this).attr('src') || '').toString().trim(),
                    'title': ($(this).attr('title') || '').toString().trim()
                });
            });

            //return the array with all found images.
            return listImages;
        }
    }
})();