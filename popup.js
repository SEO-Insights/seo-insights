chrome.tabs.query({
    active: true,
    currentWindow: true
}, tabs => {
    chrome.tabs.onUpdated.addListener(function (tabId , info) {
        if (tabs[0].id === tabId) {
            if (info.status === 'complete') {
                $('body').removeClass('not-supported');
                console.log('Reload');
                location.reload();    
            } else {
                $('body').addClass('not-supported');
            }
            
        }
    });
});

/**
 * function to handle the result of the injection of the content script.
 */
function HandleNotSupported() {
    if (chrome.runtime.lastError !== undefined) {
        $('body').addClass('not-supported');
    } else {
        $('body').removeClass('not-supported');
    }
}

//programmatically inject the content script.
chrome.tabs.executeScript({file: 'libs/jquery-3.5.1.min.js'}, HandleNotSupported);
chrome.tabs.executeScript({file: 'scripts/helper.js'}, HandleNotSupported);
chrome.tabs.executeScript({file: 'scripts/head.js'}, HandleNotSupported);
chrome.tabs.executeScript({file: 'scripts/image.js'}, HandleNotSupported);
chrome.tabs.executeScript({file: 'scripts/heading.js'}, HandleNotSupported);
chrome.tabs.executeScript({file: 'scripts/links.js'}, HandleNotSupported);
chrome.tabs.executeScript({file: 'scripts/files.js'}, HandleNotSupported);
chrome.tabs.executeScript({file: 'content.js'}, HandleNotSupported);

function GetTextWordInformation(strValue, newLine = false) {
    strValue = (strValue || '').toString().trim();

    //don't create information for empty string values.
    if (strValue.length === 0) {
        return '';
    }

    //create the badges with information about text and words.
    var strCharsBadgeHTML = '<span class="badge badge-success">' + strValue.length + ' chars</span>';
    var strWordsBadgeHTML = '<span class="badge badge-success">' + GetWordCount(strValue) + ' words</span>';

    //return the badges with information.
    return ((newLine === true) ? '<br>' : '') + strCharsBadgeHTML + strWordsBadgeHTML;
}

function GetAvailableProperties(obj) {
    var count = 0;
    for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
            if(obj[k] !== '') {
                ++count;
            }
        }
    }

    return count;
}

$(document).ready(function() {

    //init
    if ($('body').hasClass('not-supported') === false) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, tabs => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {source: SOURCE.POPUP, subject: SUBJECT.SUMMARY},
                data
            );
        });

        /**
         * Summary
         */
        const data = objMetaInfo => {

            //clear the table because we refresh this table here with current values.
            $('table#meta-head-info > tbody').empty();

            //define the required information (also if not available in object).
            var arrRequiredInfo = ['title', 'description'];
            var arrDetailedInfo = ['title', 'description', 'og:description', 'og:title', 'twitter:description', 'twitter:title'];

            //iterate through all the required information.
            for (let strRequiredInfo of arrRequiredInfo) {

                //check if the property is available.
                if (!objMetaInfo.hasOwnProperty(strRequiredInfo)) {
                    continue;
                }

                //get the value of the meta information and reset the addtional HTML information.
                var strMetaValue = '';
                var strAdditionalInfoHTML = '';

                //the value can be an array with multiple values or a single value.
                if (Array.isArray(objMetaInfo[strRequiredInfo])) {
                    strMetaValue = objMetaInfo[strRequiredInfo].join('; ');
                } else {
                    strMetaValue = objMetaInfo[strRequiredInfo];
                }
                
                //check if the current info need more details.
                if (arrDetailedInfo.includes(strRequiredInfo)) {
                    strAdditionalInfoHTML = GetTextWordInformation(strMetaValue, true);
                }

                //add the current meta info to the table.
                $('table#meta-head-info > tbody').append('<tr><td>' + strRequiredInfo + strAdditionalInfoHTML + '</td><td>' + EscapeHTML(strMetaValue) + '</td>');
            }

            //iterate through all the elements of the <head> element.
            for (let strMetaName in objMetaInfo) {
                var strMetaValue = '';

                //the value can be an array with multiple values or a single value.
                if (Array.isArray(objMetaInfo[strMetaName])) {
                    strMetaValue = objMetaInfo[strMetaName].join('; ');
                } else {
                    strMetaValue = (objMetaInfo[strMetaName] || '').toString();
                }

                //don't show the required meta information again.
                if (!arrRequiredInfo.includes(strMetaName) && strMetaValue.trim() !== '') {
                    var strAdditionalInfoHTML = '';
                    var strThemeColorHTML = '';

                    //check if the current info need more details.
                    if (arrDetailedInfo.includes(strMetaName)) {
                        strAdditionalInfoHTML = GetTextWordInformation(strMetaValue, true);
                    }

                    //we create a little label to show the theme-color as color.
                    if (strMetaName === 'theme-color') {
                        strThemeColorHTML = '<div class="theme-color" style="background: ' + strMetaValue + '"></div>';
                    }

                    //add the current meta info to the table.
                    $('table#meta-head-info > tbody').append('<tr><td>' + strMetaName + strAdditionalInfoHTML + '</td><td>' + EscapeHTML(strMetaValue) + strThemeColorHTML + '</td>');
                }
            }
        };

        $('a[href="#nav-meta"]').on('click', function() {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, tabs => {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {source: SOURCE.POPUP, subject: SUBJECT.META},
                    data
                );
            });

            const data = info => {
                
                $('table#meta-facebook > tbody').empty();
                $('table#meta-opengraph > tbody').empty();
                $('table#meta-opengraph-article > tbody').empty();
                $('table#meta-others > tbody').empty();
                $('table#meta-parsely > tbody').empty();
                $('table#meta-twitter > tbody').empty();
                
                var objMetaFacebook = info['facebook'];
                var objMetaOpenGraph = info['opengraph'];
                var objMetaArticle = info['opengraph-article'];
                var objMetaOthers = info['others'];
                var objMetaParsely = info['parsely'];
                var objMetaTwitter = info['twitter'];
                
                $('#meta-opengraph-article-heading button > .badge').remove();
                $('#meta-facebook-heading button > .badge').remove();
                $('#meta-opengraph-heading button > .badge').remove();
                $('#meta-others-heading button > .badge').remove();
                $('#meta-parsely-heading button > .badge').remove();
                $('#meta-twitter-heading button > .badge').remove();
                
                $('#meta-opengraph-article-heading button').append('<span class="badge badge-success">' + GetAvailableProperties(objMetaArticle) + ' items</span>');
                $('#meta-facebook-heading button').append('<span class="badge badge-success">' + GetAvailableProperties(objMetaFacebook) + ' items</span>');
                $('#meta-opengraph-heading button').append('<span class="badge badge-success">' + GetAvailableProperties(objMetaOpenGraph) + ' items</span>');
                $('#meta-others-heading button').append('<span class="badge badge-success">' + GetAvailableProperties(objMetaOthers) + ' items</span>');
                $('#meta-parsely-heading button').append('<span class="badge badge-success">' + GetAvailableProperties(objMetaParsely) + ' items</span>');
                $('#meta-twitter-heading button').append('<span class="badge badge-success">' + GetAvailableProperties(objMetaTwitter) + ' items</span>');
                
                var arrDetailedInfoOpenGraph = ['og:title', 'og:description'];
                var arrDetailedInfoTwitter = ['twitter:title', 'twitter:description', 'twitter:image:alt'];

                for (let strOthersName in objMetaOthers) {
                    var strOthersValue = objMetaOthers[strOthersName];

                    if (strOthersValue.trim() !== '') {
                        $('table#meta-others > tbody').append('<tr><td>' + strOthersName + '</td><td>' + EscapeHTML(strOthersValue) + '</td></tr>');
                    }
                }

                for (let strArticleName in objMetaArticle) {
                    var strArticleValue = objMetaArticle[strArticleName];

                    if (strArticleValue.trim() !== '') {
                        $('table#meta-opengraph-article > tbody').append('<tr><td>' + strArticleName + '</td><td>' + EscapeHTML(strArticleValue) + '</td></tr>');
                    }
                }

                for (let strFacebookName in objMetaFacebook) {
                    var strFacebookValue = objMetaFacebook[strFacebookName];

                    if (strFacebookValue.trim() !== '') {
                        $('table#meta-facebook > tbody').append('<tr><td>' + strFacebookName + '</td><td>' + EscapeHTML(strFacebookValue) + '</td></tr>');
                    }
                }

                for (let strParselyName in objMetaParsely) {
                    var strParselyValue = objMetaParsely[strParselyName];

                    if (strParselyValue.trim() !== '') {
                        $('table#meta-parsely > tbody').append('<tr><td>' + strParselyName + '</td><td>' + EscapeHTML(strParselyValue) + '</td></tr>');
                    }
                }

                for (let strTwitterName in objMetaTwitter) {
                    var strTwitterValue = (objMetaTwitter[strTwitterName] || '').toString().trim();
                    var strAdditionalInfoHTML = '';

                    //don't do anything in case there is no value.
                    if (strTwitterValue === '') {
                        continue;
                    }

                    //get the additional information if needed.
                    if (arrDetailedInfoTwitter.includes(strTwitterName)) {
                        strAdditionalInfoHTML = GetTextWordInformation(strTwitterValue, true);
                    }

                    //set the Twitter information to the table.
                    $('table#meta-twitter > tbody').append('<tr><td>' + strTwitterName + strAdditionalInfoHTML + '</td><td>' + EscapeHTML(strTwitterValue) + '</td></tr>');
                }

                for (let strOpenGraphName in objMetaOpenGraph) {
                    var strOpenGraphValue = (objMetaOpenGraph[strOpenGraphName] || '').toString().trim();
                    var strAdditionalInfoHTML = '';

                    //don't do anything in case there is no value.
                    if (strOpenGraphValue === '') {
                        continue;
                    }

                    //get the additional information if needed.
                    if (arrDetailedInfoOpenGraph.includes(strOpenGraphName)) {
                        strAdditionalInfoHTML = GetTextWordInformation(strOpenGraphValue, true);
                    }
                    
                    //set the OpenGraph information to the table.
                    $('table#meta-opengraph > tbody').append('<tr><td>' + strOpenGraphName + strAdditionalInfoHTML + '</td><td>' + EscapeHTML(strOpenGraphValue) + '</td></tr>');
                }
            }
        });

        //Headings
        $('a[href="#view-headings"]').on('click', ViewHeadings());

        //Images
        $('a[href="#view-images"]').on('click', ViewImages());

        //Hyperlinks
        $('a[href="#view-hyperlinks"]').on('click', ViewHyperlinks());

        //Files
        $('a[href="#view-files"]').on('click', ViewFiles());
    }
});

/**
 * View for Files.
 */
function ViewFiles() {

    //get the current / active tab of the current window and send a message
    //to the content script to get the information from website.
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(
            tabs[0].id,
            {source: SOURCE.POPUP, subject: SUBJECT.FILE},
            fnResponse   
        );
    });

    //define and execute the callback function called by the content script.
    const fnResponse = objFiles => {
        var objTableStylesheet = $('div#view-files table#files-stylesheet');
        var objTableJavaScript = $('div#view-files table#files-javascript');

        //get the arrays with files.
        var arrStylesheet = objFiles['stylesheet'];
        var arrJavaScript = objFiles['javascript'];

        //remove all rows of the stylesheet and javascript table.
        objTableStylesheet.children('tbody').empty();
        objTableJavaScript.children('tbody').empty();

        //iterate through the stylesheet files and add them to the table.
        for (let itemStylesheet of arrStylesheet) {
            objTableStylesheet.children('tbody').append('<tr><td>' + itemStylesheet + '</td></tr>');
        }

        //iterate through the javascript files and add them to the table.
        for (let itemJavaScript of arrJavaScript) {
            objTableJavaScript.children('tbody').append('<tr><td>' + itemJavaScript + '</td></tr>');
        }
    };
}

/**
 * View for Headings.
 */
function ViewHeadings() {

    //get the current / active tab of the current window and send a message
    //to the content script to get the information from website.
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(
            tabs[0].id,
            {source: SOURCE.POPUP, subject: SUBJECT.HEADING},
            fnResponse  
        );
    });

    //define and execute the callback function called by the content script.
    const fnResponse = arrHeadings => {
        var objTableHeadings = $('div#view-headings table#list-headings');
        var objTableStatsHeadings = $('div#view-headings table#statistics-headings');

        //remove all rows of the headings table.
        objTableHeadings.children('tbody').empty();

        //iterate through the different levels of headings.
        for (level = 1; level <= 6; level++) {
            objTableStatsHeadings.find('td[data-seo-info="headings-h' + level + '"]').text(arrHeadings.filter(heading => heading.type === 'h' + level).length);
        }

        //set the total count of headings to the table.
        objTableStatsHeadings.find('td[data-seo-info="headings-all"]').text(arrHeadings.length);

        //iterate through the headings and add them to the table.
        for (let itemHeading of arrHeadings) {
            objTableHeadings.children('tbody').append('<tr><td class="level-' + itemHeading.type + '"><span>' + itemHeading.type + '</span>' + itemHeading.value + GetTextWordInformation(itemHeading.value, true) + '</td></tr>');
        }
    };
}

/**
 * View for Images.
 */
function ViewImages() {

    //get the current / active tab of the current window and send a message
    //to the content script to get the information from website.
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(
            tabs[0].id,
            {source: SOURCE.POPUP, subject: SUBJECT.IMAGE},
            fnResponse
        );
    });

    //define and execute the callback function called by the content script.
    const fnResponse = arrImages => {
        var objTableImages = $('div#view-images table#list-images');
        var objTableStatsImages = $('div#view-images table#statistics-images');

        //remove all rows of the images table.
        objTableImages.children('tbody').empty();

        //iterate through the images and add them to the table.
        for (let itemImage of arrImages) {
            objTableImages.children('tbody').append('<tr><td>' + itemImage.src + '</td></tr>');
        }

        //set the statistics for the images.
        objTableStatsImages.find('td[data-seo-info="images-all"]').text(arrImages.length);
        objTableStatsImages.find('td[data-seo-info="images-without-alt"]').text(arrImages.filter(image => (image.alt || '').toString().trim() === "").length);
        objTableStatsImages.find('td[data-seo-info="images-without-src"]').text(arrImages.filter(image => (image.src || '').toString().trim() === "").length);
        objTableStatsImages.find('td[data-seo-info="images-without-title"]').text(arrImages.filter(image => (image.title || '').toString().trim() === "").length);
    };      
}

/**
 * View for Hyperlinks.
 */
function ViewHyperlinks() {

    //get the current / active tab of the current window and send a message
    //to the content script to get the information from website.
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(
            tabs[0].id,
            {source: SOURCE.POPUP, subject: SUBJECT.HYPERLINK},
            fnResponse
        );
    });

    //define and execute the callback function called by the content script.
    const fnResponse = arrHyperlinks => {
        var objTableHyperlinks = $('div#view-hyperlinks table#list-hyperlinks');
        var objTableStatsHyperlinks = $('div#view-hyperlinks table#statistics-hyperlinks');
        var objTableStatsProtocols = $('div#view-hyperlinks table#statistics-protocols');

        //remove all rows of the hyperlinks table.
        objTableHyperlinks.children('tbody').empty();

        //iterate through the hyperlinks and add them to the table.
        for (let itemHyperlink of arrHyperlinks) {
            objTableHyperlinks.children('tbody').append('<tr><td>' + itemHyperlink.value + '</td></tr>');
        }

        //set the statistics for the hyperlinks.
        objTableStatsHyperlinks.find('td[data-seo-info="hyperlinks-all"]').text(arrHyperlinks.map(link => link.count).reduce((a, b) => a + b, 0));
        objTableStatsHyperlinks.find('td[data-seo-info="hyperlinks-all-unique"]').text(arrHyperlinks.length);
        objTableStatsHyperlinks.find('td[data-seo-info="hyperlinks-internal"]').text(arrHyperlinks.filter(link => link.internal === true).map(link => link.count).reduce((a, b)=> a + b, 0));
        objTableStatsHyperlinks.find('td[data-seo-info="hyperlinks-internal-unique"]').text(arrHyperlinks.filter(link => link.internal === true).length);
        objTableStatsHyperlinks.find('td[data-seo-info="hyperlinks-external"]').text(arrHyperlinks.filter(link => link.internal === false).map(link => link.count).reduce((a, b)=> a + b, 0));
        objTableStatsHyperlinks.find('td[data-seo-info="hyperlinks-external-unique"]').text(arrHyperlinks.filter(link => link.internal === false).length);

        //set the statistics for the protocols of the hyperlinks.
        objTableStatsProtocols.find('td[data-seo-info="hyperlinks-protocol-http"]').text(arrHyperlinks.filter(link => link.url.protocol === 'http').map(link => link.count).reduce((a, b)=> a + b, 0));
        objTableStatsProtocols.find('td[data-seo-info="hyperlinks-protocol-https"]').text(arrHyperlinks.filter(link => link.url.protocol === 'https').map(link => link.count).reduce((a, b)=> a + b, 0));
        objTableStatsProtocols.find('td[data-seo-info="hyperlinks-protocol-mailto"]').text(arrHyperlinks.filter(link => link.url.protocol === 'mailto').map(link => link.count).reduce((a, b)=> a + b, 0));
        objTableStatsProtocols.find('td[data-seo-info="hyperlinks-protocol-javascript"]').text(arrHyperlinks.filter(link => link.url.protocol === 'javascript').map(link => link.count).reduce((a, b)=> a + b, 0));
        objTableStatsProtocols.find('td[data-seo-info="hyperlinks-protocol-whatsapp"]').text(arrHyperlinks.filter(link => link.url.protocol === 'whatsapp').map(link => link.count).reduce((a, b)=> a + b, 0));
    };
}