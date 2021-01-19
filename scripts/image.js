/**
 * Module for Images.
 */
var ImageModule = (function() {

    //private functions of the module.

    /**
     * function to get all images of the document.
     * @param {Document} context The context used for jQuery.
     * @returns {Object[]} An object array with all found images. 
     */
    function GetImagesOfDocument(context = undefined) {
        let arrImages = [];

        //iterate through all image elements of the site.
        $('img', context).each(function() {
            let strImageSource = ($(this).attr('src') || '').toString().trim();

            //initialize the object with the information of the image.
            let objImageInfo = {
                'alt': ($(this).attr('alt') || '').toString().trim(),
                'filename': '',
                'title': ($(this).attr('title') || '').toString().trim()
            };

            //check if the image is a image without source or specified as data.
            //in any case the image source is not a absolute or relative url.
            if (strImageSource === '' || strImageSource.startsWith('data:')) {

                //set the image source to the object and add the object to the array.
                objImageInfo.src = strImageSource;
                arrImages.push(objImageInfo);
            } else {

                //the image source should be an url to a image file.
                //try to get the full url of the image file (absolute or relative url, protocol relative url).
                try {

                    //check if the url is a protocol relative url.
                    if (strImageSource.startsWith('//')) {
                        strImageSource = location.protocol + strImageSource;
                    }

                    //get the image url (relative or absolute) as url object.
                    let objImageUrl = new URL(strImageSource, (GetBaseUrl()));
                    let strImageUrl = (objImageUrl.href || '').toString().trim();

                    //set the image source to the object and add the object to the array.
                    objImageInfo.filename = strImageUrl.substring(strImageUrl.lastIndexOf('/') + 1);
                    objImageInfo.src = strImageUrl;
                    arrImages.push(objImageInfo);
                } catch(_) { }
            }
        });

        //return all found image elements of the site.
        return arrImages;
    }

    //public functions of the module.
    return {

        /**
         * function to get all images of the current site.
         * @returns {Object[]} An object array with all found images.
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