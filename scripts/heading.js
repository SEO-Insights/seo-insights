/**
 * Module for Heading Information.
 */
var HeadingInformation = (function() {
    return {

        /**
         * Function to get all headings of the site.
         * 
         * @return {Object[]} An array with all found headings of the site.
         */
        GetHeadings: function() {
            var listHeadings = [];

            //iterate through all the heading elements of the site.
            $('h1, h2, h3, h4, h5, h6').each(function() {
                var strHeadingText = $(this).text();

                //add the found heading to the array.
                listHeadings.push({
                    'type': ($(this).prop('tagName') || '').toString().trim().toLowerCase(),
                    'value': strHeadingText
                });
            });

            //return the heading information.
            return listHeadings;
        }
    }
})();