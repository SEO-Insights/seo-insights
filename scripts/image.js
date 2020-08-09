/**
 * Module for Images.
 */
var ImageModule = (function() {

    //private functions of the module.

     /**
      * function to get all images of the document.
      * @param {Document} context The context used for jQuery.
      * @returns {Object[]} An object array with basic information of the images. 
      */
    function GetImagesOfDocument(context = undefined) {
        let arrImages = [];

        //iterate through all image elements of the page.
        $('img', context).each(function() {

            //add the basic information of the image to the array.
            arrImages.push({
                'alt': ($(this).attr('alt') || '').toString().trim(),
                'src': ($(this).attr('src') || '').toString().trim(),
                'title': ($(this).attr('title') || '').toString().trim()
            });
        });

        //return all found image elements of the page.
        return arrImages;
    }

    //public functions of the module.
    return {

        /**
         * function to get all images of the current website.
         * @returns {Object[]} An object array with basic information of the images.
         */
        GetImages: function() {
            let arrImages = [];

            //iterate through the frames of the page to get the images of the available frames.
            for (let frameIndex = 0; frameIndex < window.frames.length; frameIndex++) {
                
                //there are also blocked frames so we have to try to get the document of the frame.
                try {
                    arrImages = arrImages.concat(GetImagesOfDocument(window.frames[frameIndex].document));
                } catch(_) { }
            }

            //get all images outside of frames.
            arrImages = arrImages.concat(GetImagesOfDocument());

            //return all the found images of the page.
            return arrImages;
        }
    }
})();