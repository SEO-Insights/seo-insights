/**
 * Module for Headings.
 */
var HeadingModule = (function() {

    //private functions of the module.

    /**
     * function to get all headings of the document.
     * @param {Document} context The context used for jQuery.
     * @returns {Object[]} An object array with basic information of the headings. 
     */
    function GetHeadingsOfDocument(context = undefined) {
        let arrHeadings = [];

        //iterate through all heading elements of the site.
        $('h1, h2, h3, h4, h5, h6', context).each(function() {

            //add the basic information of the heading to the array.
            arrHeadings.push({
                'text': ($(this).text() || '').toString().trim(),
                'type': ($(this).prop('tagName') || '').toString().trim().toLowerCase(),
            });
        });

         //return all found heading elements of the site.
         return arrHeadings;
    }

    //public functions of the module.
    return {

        /**
         * function to get all headings of the current site.
         * @returns {Object[]} An object array with basic information of the headings.
         */
        GetHeadings: function() {
            let arrHeadings = [];

            //iterate through the frames of the site to get the images of the available frames.
            for (let frameIndex = 0; frameIndex < window.frames.length; frameIndex++) {

                //there are also blocked frames so we have to try to get the document of the frame.
                try {
                    arrHeadings = arrHeadings.concat(GetHeadingsOfDocument(window.frames[frameIndex].document));
                } catch(_) { }
            }

            //get all headings outside of frames.
            arrHeadings = arrHeadings.concat(GetHeadingsOfDocument());

            //return all the found headings of the site.
            return arrHeadings;
        }
    }
})();