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

function GetAdditionalInfoHTML(strValue) {
    if (strValue.length > 0) {
        var htmlBadgeCountChars = '<span class="badge badge-success">' + strValue.length + ' chars</span>';
        var htmlBadgeCountWords = '<span class="badge badge-success">' + GetWordCount(strValue) + ' words</span>';
        return '<br>' + htmlBadgeCountChars + htmlBadgeCountWords;
    } else {
        return '';
    }
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
                {from: 'popup', subject: SUBJECT.SUMMARY},
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
                    strAdditionalInfoHTML = GetAdditionalInfoHTML(strMetaValue);
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
                    strMetaValue = GetString(objMetaInfo[strMetaName]);
                }

                //don't show the required meta information again.
                if (!arrRequiredInfo.includes(strMetaName) && strMetaValue.trim() !== '') {
                    var strAdditionalInfoHTML = '';
                    var strThemeColorHTML = '';

                    //check if the current info need more details.
                    if (arrDetailedInfo.includes(strMetaName)) {
                        strAdditionalInfoHTML = GetAdditionalInfoHTML(strMetaValue);
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
                    {from: 'popup', subject: SUBJECT.META},
                    data
                );
            });

            const data = info => {
                
                $('table#meta-facebook > tbody').empty();
                $('table#meta-opengraph > tbody').empty();
                $('table#meta-opengraph-article > tbody').empty();
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
                    var strTwitterValue = GetString(objMetaTwitter[strTwitterName]).trim();
                    var strAdditionalInfoHTML = '';

                    //don't do anything in case there is no value.
                    if (strTwitterValue === '') {
                        continue;
                    }

                    //get the additional information if needed.
                    if (arrDetailedInfoTwitter.includes(strTwitterName)) {
                        strAdditionalInfoHTML = GetAdditionalInfoHTML(strTwitterValue);
                    }

                    //set the Twitter information to the table.
                    $('table#meta-twitter > tbody').append('<tr><td>' + strTwitterName + strAdditionalInfoHTML + '</td><td>' + EscapeHTML(strTwitterValue) + '</td></tr>');
                }

                for (let strOpenGraphName in objMetaOpenGraph) {
                    var strOpenGraphValue = GetString(objMetaOpenGraph[strOpenGraphName]).trim();
                    var strAdditionalInfoHTML = '';

                    //don't do anything in case there is no value.
                    if (strOpenGraphValue === '') {
                        continue;
                    }

                    //get the additional information if needed.
                    if (arrDetailedInfoOpenGraph.includes(strOpenGraphName)) {
                        strAdditionalInfoHTML = GetAdditionalInfoHTML(strOpenGraphValue);
                    }
                    
                    //set the OpenGraph information to the table.
                    $('table#meta-opengraph > tbody').append('<tr><td>' + strOpenGraphName + strAdditionalInfoHTML + '</td><td>' + EscapeHTML(strOpenGraphValue) + '</td></tr>');
                }
            }
        });

        $('a[href="#nav-headings"]').on('click', function() {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, tabs => {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {from: 'popup', subject: SUBJECT.HEADING},
                    data
                );
            });

            const data = info => {

                $('table#meta-headings').empty();
                
                //headInfo
                let heading = info['heading'];

                $('*[data-seo-info="meta-heading-h1-count"]').text(heading.counts.h1);
                $('*[data-seo-info="meta-heading-h2-count"]').text(heading.counts.h2);
                $('*[data-seo-info="meta-heading-h3-count"]').text(heading.counts.h3);
                $('*[data-seo-info="meta-heading-h4-count"]').text(heading.counts.h4);
                $('*[data-seo-info="meta-heading-h5-count"]').text(heading.counts.h5);
                $('*[data-seo-info="meta-heading-h6-count"]').text(heading.counts.h6);
                $('*[data-seo-info="meta-heading-total-count"]').text(heading.counts.all);

                for (let infoHeading of heading.headings) {
                    $('table#meta-headings').append('<tr><td class="level-' + infoHeading.tag + '"><span>' + infoHeading.tag + '</span>' + infoHeading.title + '<br><span class="badge badge-success">' + infoHeading.count_chars + ' chars</span><span class="badge badge-success">' + infoHeading.count_words + ' words</span></td></tr>');
                }
            }
        });

        $('a[href="#nav-images"]').on('click', function() {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, tabs => {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {from: 'popup', subject: SUBJECT.IMAGE},
                    data
                );
            });

            const data = listImages => {

                //remove all the rows of the hyperlinks table.
                $('table#meta-images > tbody').empty();

                //set the statistics of the images.
                $('*[data-seo-info="meta-images-count-all"]').text(listImages.length);
                $('*[data-seo-info="meta-images-count-without-alt"]').text(listImages.filter(image => GetString(image.alt).trim() === "").length);
                $('*[data-seo-info="meta-images-count-without-src"]').text(listImages.filter(image => GetString(image.src).trim() === "").length);
                $('*[data-seo-info="meta-images-count-without-title"]').text(listImages.filter(image => GetString(image.title).trim() === "").length);

                for (let itemImage of listImages) {
                    if (itemImage.src !== '') {
                        $('table#meta-images > tbody').append('<tr><td>' + itemImage.src + '</td></tr>');
                    }
                }
            }
        });

        $('a[href="#nav-links"]').on('click', function() {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, tabs => {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {from: 'popup', subject: SUBJECT.HYPERLINK},
                    data
                );
            });
            
            const data = listHyperlinks => {

                //remove all the rows of the hyperlinks table.
                $('table#meta-links > tbody').empty();

                //set the statistics for the hyperlinks.
                $('*[data-seo-info="meta-links-count-all"]').text(listHyperlinks.map(link => link.count).reduce((a, c)=> a + c, 0));
                $('*[data-seo-info="meta-links-count-unique"]').text(listHyperlinks.length);
                $('*[data-seo-info="meta-links-count-internal"]').text(listHyperlinks.filter(link => link.internal === true).map(link => link.count).reduce((a, c)=> a + c, 0));
                $('*[data-seo-info="meta-links-count-internal-unique"]').text(listHyperlinks.filter(link => link.internal === true).length);
                $('*[data-seo-info="meta-links-count-external"]').text(listHyperlinks.filter(link => link.internal === false).map(link => link.count).reduce((a, c)=> a + c, 0));
                $('*[data-seo-info="meta-links-count-external-unique"]').text(listHyperlinks.filter(link => link.internal === false).length);

                //set the statistics for the protocols of the hyperlinks.
                $('*[data-seo-info="meta-links-protocol-http"]').text(listHyperlinks.filter(link => link.url.protocol === 'http').map(link => link.count).reduce((a, c)=> a + c, 0));
                $('*[data-seo-info="meta-links-protocol-https"]').text(listHyperlinks.filter(link => link.url.protocol === 'https').map(link => link.count).reduce((a, c)=> a + c, 0));
                $('*[data-seo-info="meta-links-protocol-mailto"]').text(listHyperlinks.filter(link => link.url.protocol === 'mailto').map(link => link.count).reduce((a, c)=> a + c, 0));
                $('*[data-seo-info="meta-links-protocol-javascript"]').text(listHyperlinks.filter(link => link.url.protocol === 'javascript').map(link => link.count).reduce((a, c)=> a + c, 0));
                $('*[data-seo-info="meta-links-protocol-whatsapp"]').text(listHyperlinks.filter(link => link.url.protocol === 'whatsapp').map(link => link.count).reduce((a, c)=> a + c, 0));

                //iterate through the hyperlinks and set them to the table.
                for (const itemHyperlink of listHyperlinks) {
                    $('table#meta-links > tbody').append('<tr><td>' + itemHyperlink.value + '</td></tr>');
                }
            };
        });

        $('a[href="#nav-files"]').on('click', function() {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, tabs => {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {from: 'popup', subject: SUBJECT.FILE},
                    data
                );
            });

            const data = filesInfo => {
                var listStylesheet = filesInfo['stylesheet'];
                var listJavaScript = filesInfo['javascript'];

                $('div#files-stylesheet-heading button span.badge').remove();
                $('div#files-javascript-heading button span.badge').remove();

                $('div#files-stylesheet-heading button').append('<span class="badge badge-success">' + listStylesheet.length + ' files</span>');
                $('div#files-javascript-heading button').append('<span class="badge badge-success">' + listJavaScript.length + ' files</span>');
                
                for (let fileStylesheet of listStylesheet) {
                    $('table#files-stylesheet').append('<tr><td>' + fileStylesheet + '</td></tr>');
                }

                for (let fileJavaScript of listJavaScript) {
                    $('table#files-javascript').append('<tr><td>' + fileJavaScript + '</td></tr>');
                }
            }
        });
    }
});