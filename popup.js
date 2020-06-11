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
chrome.tabs.executeScript({file: 'content.js'}, HandleNotSupported);

function GetAdditionalInfoHTML(objMetaElement) {
    if(objMetaElement.value.length > 0) {
        var htmlBadgeCountChars = '<span class="new badge blue" data-badge-caption="chars">' + objMetaElement.value.length + '</span>';
        var htmlBadgeCountWords = '<span class="new badge blue" data-badge-caption="words">' + GetWordCount(objMetaElement.value) + '</span>';
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

    //initialize the materialize tabs.
    $('.tabs').tabs();
    $('.collapsible').collapsible();

    //init
    if ($('body').hasClass('not-supported') === false) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, tabs => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {from: 'popup', subject: 'initialization'},
                data
            );
        });

        /**
         * Summary
         */
        const data = objMetaTags => {

            $('table#meta-head-info > tbody').empty();

            //define the required information (also if not available in object).
            var arrRequiredInfo = ['title', 'description'];
            var arrDetailedInfo = ['title', 'description', 'og:description', 'og:title', 'twitter:description', 'twitter:title'];

            //iterate through all the required information.
            for (let strRequiredInfo of arrRequiredInfo) {
                var htmlAdditionalInfo = '';

                if(arrDetailedInfo.includes(strRequiredInfo)) {
                    htmlAdditionalInfo = GetAdditionalInfoHTML(objMetaTags[strRequiredInfo]);
                }

                $('table#meta-head-info > tbody').append('<tr><td>' + EscapeHTML(objMetaTags[strRequiredInfo].name) + htmlAdditionalInfo + '</td><td>' + objMetaTags[strRequiredInfo].value + '</td>');
            }

            //iterate through all elements of the <head> element.
            for (let strInfo in objMetaTags) {
                if(!arrRequiredInfo.includes(strInfo) && objMetaTags[strInfo].value.trim() !== '') {
                    var htmlThemeColor = '';
                    var htmlAdditionalInfo = '';

                    if(objMetaTags[strInfo].name === 'theme-color') {
                        htmlThemeColor = '<span class="theme-color-preview" style="background:' + objMetaTags[strInfo].value + '"></span>';
                    }

                    if(arrDetailedInfo.includes(strInfo)) {
                        htmlAdditionalInfo = GetAdditionalInfoHTML(objMetaTags[strInfo]);
                    }

                    $('table#meta-head-info > tbody').append('<tr><td>' + EscapeHTML(objMetaTags[strInfo].name) + htmlAdditionalInfo + '</td><td>' + objMetaTags[strInfo].value + htmlThemeColor + '</td>');
                }
            }
        }

        $('a[href="#meta"]').on('click', function() {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, tabs => {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {from: 'popup', subject: 'meta'},
                    data
                );
            });

            const data = info => {
                
                $('table#meta-article > tbody').empty();
                $('table#meta-opengraph > tbody').empty();
                $('table#meta-parsely > tbody').empty();
                $('table#meta-twitter > tbody').empty();
                
                var objMetaArticle = info['article'];
                var objMetaOpenGraph = info['opengraph'];
                var objMetaParsely = info['parsely'];
                var objMetaTwitter = info['twitter'];

                $('li#meta-article-card > div[class*="header"] > .badge').remove();
                $('li#meta-opengraph-card > div[class*="header"] > .badge').remove();
                $('li#meta-parsely-card > div[class*="header"] > .badge').remove();
                $('li#meta-twitter-card > div[class*="header"] > .badge').remove();

                $('li#meta-article-card > div[class*="header"]').append('<span class="new badge blue" data-badge-caption="items">' + GetAvailableProperties(objMetaArticle) + '</span>');
                $('li#meta-opengraph-card > div[class*="header"]').append('<span class="new badge blue" data-badge-caption="items">' + GetAvailableProperties(objMetaOpenGraph) + '</span>');
                $('li#meta-parsely-card > div[class*="header"]').append('<span class="new badge blue" data-badge-caption="items">' + GetAvailableProperties(objMetaParsely) + '</span>');
                $('li#meta-twitter-card > div[class*="header"]').append('<span class="new badge blue" data-badge-caption="items">' + GetAvailableProperties(objMetaTwitter) + '</span>');

                console.log(GetAvailableProperties(objMetaArticle));

                for (let strInfo in objMetaArticle) {
                    var objMetaItem = objMetaArticle[strInfo];

                    if (objMetaItem.value.trim() !== '') {
                        $('table#meta-article > tbody').append('<tr><td>' + EscapeHTML(objMetaItem.name) + '</td><td>' + objMetaItem.value + '</td>');
                    }
                }

                for (let strInfo in objMetaParsely) {
                    var objMetaItem = objMetaParsely[strInfo];

                    if (objMetaItem.value.trim() !== '') {
                        $('table#meta-parsely > tbody').append('<tr><td>' + EscapeHTML(objMetaItem.name) + '</td><td>' + objMetaItem.value + '</td>');
                    }
                }

                for (let strInfo in objMetaTwitter) {
                    var objMetaItem = objMetaTwitter[strInfo];

                    if (objMetaItem.value.trim() !== '') {
                        $('table#meta-twitter > tbody').append('<tr><td>' + EscapeHTML(objMetaItem.name) + '</td><td>' + objMetaItem.value + '</td>');
                    }
                }

                for (let strInfo in objMetaOpenGraph) {
                    var objMetaItem = objMetaOpenGraph[strInfo];

                    if (objMetaItem.value.trim() !== '') {
                        $('table#meta-opengraph > tbody').append('<tr><td>' + EscapeHTML(objMetaItem.name) + '</td><td>' + objMetaItem.value + '</td>');
                    }
                }
            }
        });

        $('a[href="#headings"]').on('click', function() {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, tabs => {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {from: 'popup', subject: 'headings'},
                    data
                );
            });

            const data = info => {

                $('div#meta-heading-list').empty();
                
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
                    $('div#meta-heading-list').append('<div class="level-' + infoHeading.tag + '"><span>' + infoHeading.tag + '</span>' + infoHeading.title + '<br><span class="new badge blue" data-badge-caption="chars">' + infoHeading.count_chars + '</span><span class="new badge blue" data-badge-caption="words">' + infoHeading.count_words + '</span></div>');
                }
            }
        });

        $('a[href="#images"]').on('click', function() {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, tabs => {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {from: 'popup', subject: 'images'},
                    data
                );
            });

            const data = info => {

                $('table#meta-images > tbody').empty();

                $('*[data-seo-info="meta-images-count-all"]').text(info.images.count.all);
                $('*[data-seo-info="meta-images-count-without-alt"]').text(info.images.count.without_alt);
                $('*[data-seo-info="meta-images-count-without-src"]').text(info.images.count.without_src);
                $('*[data-seo-info="meta-images-count-without-title"]').text(info.images.count.without_title);

                for (let image of info.images.images) {
                    if (image.src.trim() !== '') {
                        $('table#meta-images > tbody').append('<tr><td>' + image.src + '</td></tr>');
                    }
                }
            }
        });

        $('a[href="#links"]').on('click', function() {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, tabs => {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {from: 'popup', subject: 'links'},
                    data
                );
            });

            const data = info => {

                $('table#meta-links > tbody').empty();

                $('*[data-seo-info="meta-links-count-all"]').text(info.links.count.all);
                $('*[data-seo-info="meta-links-count-unique"]').text(info.links.count.all_unique);
                $('*[data-seo-info="meta-links-count-internal"]').text(info.links.count.internal);
                $('*[data-seo-info="meta-links-count-internal-unique"]').text(info.links.count.internal_unique);
                $('*[data-seo-info="meta-links-count-external"]').text(info.links.count.external);
                $('*[data-seo-info="meta-links-count-external-unique"]').text(info.links.count.external_unique);
                $('*[data-seo-info="meta-links-count-without-target"]').text(info.links.count.missing);

                for (let link of info.links.links) {
                    var badgeLevel = '';

                    if (link.level !== 0 && (['script', 'anchor']).includes(link.type) === false) {
                        badgeLevel = '<span class="new badge blue" data-badge-caption="levels">' + link.level + '</span>';
                    }

                    var badgeCount = '<span class="new badge blue" data-badge-caption="x">' + link.count + '</span>';

                    $('table#meta-links > tbody').append('<tr><td>' + link.href + '<br><span class="new badge blue" data-seo-info="meta-links-type" data-badge-caption="">' + link.type + '</span>' + badgeLevel + badgeCount + '</td></tr>');
                }
            }
        });
    }
});