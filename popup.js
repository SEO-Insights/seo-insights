//common information about the website.
let tabUrl = '';
let tabUrlOrigin = '';

//start the chrome extension and inject the scripts to the website.
//the injected scripts are used to get the needed information about the website.
(function() {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const tab = tabs[0];

		//set the common information about the website.
		tabUrl = tab.url;
    tabUrlOrigin = (new URL(tab.url)).origin;

    //check whether it is possible to inject a content script to the current tab.
		//there are some protocols and sites where no content script can be injected.
    if (!CanInjectContentScript(tab)) {
      $('body').addClass('not-supported');
      return false;
    } else {
      $('body').removeClass('not-supported');
    }

    //programmatically inject the content scripts to the current tab.
    chrome.scripting.executeScript({files: ['libs/jquery-3.6.0.min.js'], target: {tabId: tab.id}});
    chrome.scripting.executeScript({files: ['scripts/helper.js'], target: {tabId: tab.id}});
    chrome.scripting.executeScript({files: ['scripts/dublincore.js'], target: {tabId: tab.id}});
    chrome.scripting.executeScript({files: ['scripts/opengraph.js'], target: {tabId: tab.id}});
    chrome.scripting.executeScript({files: ['scripts/head.js'], target: {tabId: tab.id}});
    chrome.scripting.executeScript({files: ['scripts/image.js'], target: {tabId: tab.id}});
    chrome.scripting.executeScript({files: ['scripts/heading.js'], target: {tabId: tab.id}});
    chrome.scripting.executeScript({files: ['scripts/link.js'], target: {tabId: tab.id}});
    chrome.scripting.executeScript({files: ['scripts/files.js'], target: {tabId: tab.id}});
    chrome.scripting.executeScript({files: ['content.js'], target: {tabId: tab.id}}, () => {
      chrome.tabs.sendMessage(tab.id, {source: SOURCE.POPUP, subject: SUBJECT.SUMMARY}, CallbackSummary);
    });
  });
})();

/**
 * Returns the state whether a content script can be injected into a tab.
 * @param {chrome.tabs.Tab} tab The tab which should be checked whether a content script can be injected.
 * @returns {boolean} The state whether a content script can be injected.
 */
function CanInjectContentScript(tab) {

	//it is not possible to inject content scripts to the chrome webstore.
	if (tab.url.startsWith('https://chrome.google.com/webstore')) {
		return false;
	}

	//it is possible to inject content scripts to url's with HTTP / HTTPS.
  return (tab.url.startsWith('http://') || tab.url.startsWith('https://'));
}

/**
 * Sets the count of table items to the card header.
 * @param {object} cardHeader The card header to set the count of table items.
 * @param {object} table The table container to get the count of items.
 */
function SetTableCountOnCardHeader(cardHeader, table) {
	const cntItems = $(table).find('tr').length;
	const cardHeaderButton = $(cardHeader).find('button');

	//first remove the info on the HTML element.
	$('span.info', cardHeaderButton).remove();

	//set the count of items to the card header.
	$(cardHeaderButton).append('<span class="info">' + cntItems + ' items</span>');
	$(cardHeaderButton).prop('disabled', (cntItems === 0));
}

/**
 * Resets all filter controls on the headings tab.
 */
function ResetHeadingFilter() {
	$('tr.filter td[id^="headings-h"]').each(function() {
		$(this).off('click');
		$(this).css('color', '#000');
	});
}

/**
 * Callback function of the heading filter items.
 * @param {object} event The event object.
 */
function CallbackHeadingFilter(event) {

	//don't use the filter on not existing elements.
	if ($(this).text() === '0') {
		return;
	}

	//toggle the filter depending on filter state.
	if ($('tr.level-h' + event.data.level).is(':hidden')) {
		$('tr.level-h' + event.data.level).show();
		$(this).css('color', '#000');
	} else {
		$('tr.level-h' + event.data.level).hide();
		$(this).css('color', '#ccc');
	}
}

/**
 * Replace all placeholder for translation with translated value.
 */
function TranslateHTML() {
	document.body.innerHTML = document.body.innerHTML.replace(/__MSG_(\w+)__/g, function(match, word) {
		return word ? chrome.i18n.getMessage(word) : '';
	});
}

/**
 * Shows a image when hover a specific HTML element.
 * @param {object} hoverItem The HTML element to bind the hover event to.
 * @param {string} imgUrl The image path to show on image preview.
 */
function ShowImagePreview(hoverItem, imgUrl) {
	$(hoverItem).on('mouseenter', function() {
		$('body div.img-preview').remove();
		$('body').append(`<div class="img-preview"><img src="${imgUrl}"></div>`);
	}).on('mouseleave', function() {
		$('body div.img-preview').remove();
	});
}

/**
 * Returns all domains of the given urls.
 * @param {string[]} urls An array with all urls to get the domains from.
 * @returns An array with all domains of the given urls.
 */
 function GetDomains(urls) {
	let domains = [];

	//run through all urls to get the domain from.
	urls.filter(url => (url || '').toString().trim() !== '').forEach(function(url) {
		const domain = (new URL(url, tabUrlOrigin).host || '').toString().trim();

		//only add existing domains. don't add empty domains..
		if (domain !== '') {
			domains.push(domain);
		}
	});

	//return all found domains of the urls.
	return domains;
}

/**
 * Sets a hint to a empty table as placeholder / additional information.
 * @param {object} table The HTML object of the table.
 * @param {string} hint The hint to be shown on the empty table.
 */
function SetEmptyHint(table, hint) {
	if (table.children('tbody').children().length === 0) {
		table.children('tbody').append(`<tr class="alert"><td><div class="alert alert-primary" role="alert">${hint}</div></td></tr>`);
	}
}




function GetTextWordInformation(strValue, newLine = false) {
    strValue = (strValue || '').toString().trim();

    //don't create information for empty string values.
    if (strValue.length === 0) {
        return '';
    }

    //create the tags for information about characters and words.
    var strCharsHTML = '<span class="info">' + strValue.length + ' ' + chrome.i18n.getMessage('chars') + '</span>';
    var strWordsHTML = '<span class="info">' + GetWordCount(strValue) + ' ' + chrome.i18n.getMessage('words') + '</span>';

    //return the tags with information.
    return ((newLine === true) ? '<br>' : '') + strCharsHTML + strWordsHTML;
}

function GetHeaderInformation(url) {
	window.scrollTo(0, 0);
    $('table#info-headers > tbody').empty();
    fetch(url).then(function(response) {
        for (var p of response.headers.entries()) {
            $('table#info-headers > tbody').append(GetInformationRow(p[0], p[1]));
        }

        $('table#info-headers > tbody').append(GetInformationRow('HTTP Status', response.status));
        $('table#info-headers > tbody').append(GetInformationRow('HTTP Version', response.statusText.trim() === '' ? 'HTTP/2' : 'HTTP/1'));
    });
}

function GetInformationRow(strValueColumn1, strValueColumn2, markerName, markerValue) {
	if (markerName && markerValue) {
		return '<tr ' + markerName + '="' + markerValue + '"><td>' + strValueColumn1 + '</td><td>' + strValueColumn2 + '</td></tr>';
	} else {
		return '<tr><td>' + strValueColumn1 + '</td><td>' + strValueColumn2 + '</td></tr>';
	}
}

/**
 * function to get a row with formatted color value(s).
 *
 * @param {string} metaName The name of the meta element.
 * @param {string|string[]} metaValue The value of the meta element or an array of values.
 * @returns {string} The row with information of the meta element (value formatted as color).
 */
function GetColorRow(metaName, metaValue) {

    if (typeof metaValue === 'string') {
        metaValue = [metaValue];
    }

    if (Array.isArray(metaValue) && metaValue.length > 0) {
        var htmlColorValue = '';

        for (let colorValue of metaValue) {
					let convertColor = '';

					if (colorValue.startsWith('rgba') || colorValue.startsWith('rgb')) {
						convertColor = rgb2hex(colorValue);
					} else {
						convertColor = colorValue;
					}

					htmlColorValue += '<div class="theme-color" style="background: ' + colorValue + '; color: ' + invertColor(convertColor, true) + '">' + colorValue + '</div>';
        }

        return GetInformationRow(metaName, htmlColorValue);
    }
}





function GetDefaultRow(metaName, metaValue) {
    var arrDetailedInfo = ['title', 'description', 'og:description', 'og:title', 'twitter:description', 'twitter:title'];
    var strMetaValueHTML = '';

    if (Array.isArray(metaValue) && metaValue.length > 0) {

        //escape the HTML of the meta value so HTML tags are visible.
        for (indexValue = 0; indexValue < metaValue.length; indexValue++) {
            metaValue[indexValue] = EscapeHTML(metaValue[indexValue]);
        }

        //format multiple values as list.
        if (metaValue.length > 1) {
            strMetaValueHTML = '<ul><li>' + metaValue.join('</li><li>') + '</li></ul>';
        } else {
            strMetaValueHTML = metaValue;
        }
    } else {
        strMetaValueHTML = metaValue;
    }

    if (arrDetailedInfo.includes(metaName)) {
        return GetInformationRow(metaName + GetTextWordInformation(metaValue, true), strMetaValueHTML);
    } else {
        return GetInformationRow(metaName, strMetaValueHTML);
    }
}
function GetCanonicalRow(metaName, metaValue) {
    if (metaValue.selfref === true) {
        return GetInformationRow(metaName + '<br><span class="info">self-referential</span>', EscapeHTML(metaValue.value));
    } else {
        return GetInformationRow(metaName, EscapeHTML(metaValue.value));
    }
}
function GetGeneratorRow(metaName, metaValue) {
    if (Array.isArray(metaValue)) {

        //escape the HTML of the meta value so HTML tags are visible.
        for (indexValue = 0; indexValue < metaValue.length; indexValue++) {
            metaValue[indexValue] = EscapeHTML(metaValue[indexValue]);
        }

        //format multiple values as list.
        if (metaValue.length > 1) {
            strMetaValue = '<ul>';
            metaValue.forEach(meta => {
                strMetaValue += '<li>' + meta + '</li>';
            });
            strMetaValue += '</ul>';
        } else {
            strMetaValue = metaValue;
        }
    } else {
        strMetaValue = (metaValue || '').toString();
    }

    return GetInformationRow(metaName, strMetaValue);
}

function CallbackSummary(meta) {
  window.scrollTo(0, 0);

  //clear the table because we refresh this table here with current values.
  $('table#meta-head-info > tbody').empty();

  //iterate through all the elements of the <head> element.
  for (let strMetaName in meta) {
      switch (strMetaName) {
          case 'canonical':
              $('table#meta-head-info > tbody').append(GetCanonicalRow(strMetaName, meta[strMetaName]));
              break;
          case 'generator':
              $('table#meta-head-info > tbody').append(GetGeneratorRow(strMetaName, meta[strMetaName]));
              break;
          case 'theme-color':
              $('table#meta-head-info > tbody').append(GetColorRow(strMetaName, meta[strMetaName]));
              break;
          default:
              $('table#meta-head-info > tbody').append(GetDefaultRow(strMetaName, meta[strMetaName]));
              break;
      }
  }
}


jQuery(function() {

	//translate all placeholder of the extension.
	TranslateHTML();

  function GroupByName(objects) {
    let arr = [];
    for (let obj of objects) {

      arrFiltered = arr.filter(objItem => objItem.name === obj.name);
      if (arrFiltered.length === 1)  {
        arrFiltered[0].value.push(obj.value);
      } else {
        arr.push({'name': obj.name, 'value': [obj.value]});
      }
    }
    return arr;
  }

    //init
    if ($('body').hasClass('not-supported') === false) {

      $('a[href="#view-summary"]').on('click', function() {
        chrome.tabs.query({
          active: true,
          currentWindow: true
      }, tabs => {
          chrome.tabs.sendMessage(
              tabs[0].id,
              {source: SOURCE.POPUP, subject: SUBJECT.SUMMARY},
              CallbackSummary
          );
      });
      });

        $('a[href="#view-meta"]').on('click', function() {
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
                window.scrollTo(0, 0);

                //clear all meta tables.
                $('table[id^=meta-details-] > tbody').empty();

                var objMetaFacebook = info['facebook'];
                var objMetaOpenGraph = info['opengraph'];
                let objMetaOpenGraphArticle = info['opengraph-article'];
                let objMetaOpenGraphAudio = info['opengraph-audio'];
                let objMetaOpenGraphBook = info['opengraph-book'];
                let objMetaOpenGraphImage = info['opengraph-image'];
                let objMetaOpenGraphProfile = info['opengraph-profile'];
                let objMetaOpenGraphVideo = info['opengraph-video'];
                var objMetaOthers = info['others'];
                var objMetaParsely = info['parsely'];
                var objMetaTwitter = info['twitter'];
                var objMetaDublinCore = info['dublin-core'];

                var arrDetailedInfoOpenGraph = ['og:title', 'og:description'];
                var arrDetailedInfoTwitter = ['twitter:title', 'twitter:description', 'twitter:image:alt'];

								objMetaOthers.forEach(function(tagItem, tagIndex) {
									var strOthersValue = (tagItem.value || '').toString().trim();

									switch (tagItem.name) {
										case 'msapplication-TileColor':
											$('table#meta-details-others > tbody').append(GetColorRow(tagItem.name, strOthersValue));
											break;
										default:
											$('table#meta-details-others > tbody').append(GetInformationRow(tagItem.name, EscapeHTML(strOthersValue), 'seo-data', 'meta-others-' + tagIndex));
											break;
									}

									if (tagItem.name.toLowerCase() === 'msapplication-tileimage') {
										ShowImagePreview($('tr[seo-data="meta-others-' + tagIndex + '"] td'), new URL(strOthersValue, tabUrlOrigin));
									}
								});

                for (let infoOpenGraphArticle of GroupByName(objMetaOpenGraphArticle)) {
                    var strArticleValue = (infoOpenGraphArticle.value.join('; ') || '').toString().trim();
                    $('table#meta-details-opengraph-article > tbody').append(GetInformationRow(infoOpenGraphArticle.name, EscapeHTML(strArticleValue)));
                }

                for (let tagInfoAudio of objMetaOpenGraphAudio) {
                  const value = (tagInfoAudio.value || '').toString().trim();
                  $('table#meta-details-opengraph-audio > tbody').append(GetInformationRow(tagInfoAudio.name, EscapeHTML(value)));
                }

                for (let tagInfoBook of objMetaOpenGraphBook) {
                  const value = (tagInfoBook.value || '').toString().trim();
                  $('table#meta-details-opengraph-book > tbody').append(GetInformationRow(tagInfoBook.name, EscapeHTML(value)));
                }

								objMetaOpenGraphImage.forEach(function(ogItem, ogIndex) {
									const value = (ogItem.value || '').toString().trim();
									$('table#meta-details-opengraph-image > tbody').append(GetInformationRow(ogItem.name, EscapeHTML(value), 'seo-data', 'og-image-' + ogIndex));

									if (ogItem.name === 'og:image:url') {
										ShowImagePreview($('table#meta-details-opengraph-image > tbody tr[seo-data="og-image-' + ogIndex + '"]'), value);
									}
								});

                for (let tagInfoProfile of objMetaOpenGraphProfile) {
                  const value = (tagInfoProfile.value || '').toString().trim();
                  $('table#meta-details-opengraph-profile > tbody').append(GetInformationRow(tagInfoProfile.name, EscapeHTML(value)));
                }

                for (let tagInfoVideo of objMetaOpenGraphVideo) {
                  const value = (tagInfoVideo.value || '').toString().trim();
                  $('table#meta-details-opengraph-video > tbody').append(GetInformationRow(tagInfoVideo.name, EscapeHTML(value)));
                }

                for (let tagFacebook of objMetaFacebook) {
                    var strFacebookValue = (tagFacebook.value || '').toString().trim();
                    $('table#meta-details-facebook > tbody').append(GetInformationRow(tagFacebook.name, EscapeHTML(strFacebookValue)));
                }

                for (let tagParsely of objMetaParsely) {
                    var strParselyValue = (tagParsely.value || '').toString().trim();
                    $('table#meta-details-parsely > tbody').append(GetInformationRow(tagParsely.name, EscapeHTML(strParselyValue)));
                }

								objMetaTwitter.forEach(function(twitterItem, twitterIndex) {
									 var strTwitterValue = (twitterItem.value || '').toString().trim();
                    var strAdditionalInfoHTML = '';

                    //get the additional information if needed.
                    if (arrDetailedInfoTwitter.includes(twitterItem.name)) {
                        strAdditionalInfoHTML = GetTextWordInformation(strTwitterValue, true);
                    }

                    //set the Twitter information to the table.
                    $('table#meta-details-twitter > tbody').append(GetInformationRow(twitterItem.name + strAdditionalInfoHTML, EscapeHTML(strTwitterValue), 'seo-data', 'twitter-' + twitterIndex));

										if (twitterItem.name === 'twitter:image') {
											ShowImagePreview($('tr[seo-data="twitter-' + twitterIndex + '"] td'), strTwitterValue);
										}
								});

								objMetaOpenGraph.forEach(function(ogItem, ogIndex) {
									var strOpenGraphValue = (ogItem.value || '').toString().trim();
									var strAdditionalInfoHTML = '';

									//get the additional information if needed.
									if (arrDetailedInfoOpenGraph.includes(ogItem.name)) {
											strAdditionalInfoHTML = GetTextWordInformation(strOpenGraphValue, true);
									}

									//set the OpenGraph information to the table.
									$('table#meta-details-opengraph-basic > tbody').append(GetInformationRow(ogItem.name + strAdditionalInfoHTML, EscapeHTML(strOpenGraphValue), 'seo-data', 'og-basic-' + ogIndex));

									if (ogItem.name.toLowerCase() === 'og:image') {
										ShowImagePreview($('tr[seo-data="og-basic-' + ogIndex + '"]'), strOpenGraphValue);
									}
								});

                if (Object.keys(objMetaOpenGraph).length > 0) {

                    //The four required properties for every page are: og:title, og:type, og:image, og:url
                    //https://ogp.me/
                    for (itemRequiredOpenGraph of ['og:title', 'og:type', 'og:image', 'og:url']) {
                      if (objMetaOpenGraph.filter(infoOpenGraph => infoOpenGraph.name === itemRequiredOpenGraph).length === 0) {
                        $('table#meta-details-errors > tbody').append('<tr><td>Missing required Open Graph information: ' + itemRequiredOpenGraph + '.</td></tr>');
                      }
                    }
                }

                for (let tagDublinCore of objMetaDublinCore) {
                    var strDublinCoreValue = (tagDublinCore.value || '').toString().trim();
                    $('table#meta-details-dublin-core > tbody').append(GetInformationRow(tagDublinCore.name, EscapeHTML(strDublinCoreValue)));
                }

                //now all lists are created so it is possible to count the items of each list.
								SetTableCountOnCardHeader($('#meta-details-opengraph-heading'), $('div#meta-details-opengraph-content'));
                SetTableCountOnCardHeader($('#meta-opengraph-basic-heading'), $('table#meta-details-opengraph-basic'));
                SetTableCountOnCardHeader($('#meta-opengraph-article-heading'), $('table#meta-details-opengraph-article'));
                SetTableCountOnCardHeader($('#meta-opengraph-audio-heading'), $('table#meta-details-opengraph-audio'));
                SetTableCountOnCardHeader($('#meta-opengraph-book-heading'), $('table#meta-details-opengraph-book'));
                SetTableCountOnCardHeader($('#meta-opengraph-image-heading'), $('table#meta-details-opengraph-image'));
                SetTableCountOnCardHeader($('#meta-opengraph-profile-heading'), $('table#meta-details-opengraph-profile'));
                SetTableCountOnCardHeader($('#meta-opengraph-video-heading'), $('table#meta-details-opengraph-video'));
                SetTableCountOnCardHeader($('#meta-details-facebook-heading'), $('table#meta-details-facebook'));
                SetTableCountOnCardHeader($('#meta-details-twitter-heading'), $('table#meta-details-twitter'));
                SetTableCountOnCardHeader($('#meta-details-dublin-core-heading'), $('table#meta-details-dublin-core'));
                SetTableCountOnCardHeader($('#meta-details-parsely-heading'), $('table#meta-details-parsely'));
                SetTableCountOnCardHeader($('#meta-details-others-heading'), $('table#meta-details-others'));
                SetTableCountOnCardHeader($('#meta-details-errors-heading'), $('table#meta-details-errors'));
            }
        });

        //Headings
        $('a[href="#view-headings"]').on('click', ViewHeadings);

        //Images
        $('a[href="#view-images"]').on('click', ViewImages);

        //Hyperlinks
        $('a[href="#view-hyperlinks"]').on('click', ViewHyperlinks);

        //Files
        $('a[href="#view-files"]').on('click', ViewFiles);

        //Headers
        $('a[href="#view-headers"]').on('click', ViewHeader);

        $('a[href="#view-tools"]').on('click', ViewTools);
    }
});


function ViewHeader() {
    GetHeaderInformation(tabUrl);
}

/**
 * View for Tools.
 */
function ViewTools() {
	window.scrollTo(0, 0);

    //get the table of the tools list.
	const objTableTools = $('div#view-tools table#info-tools');

    //remove all available tools.
    objTableTools.children('tbody').empty();
	objTableTools.children('tbody').append(GetToolsItem(chrome.i18n.getMessage('tools_pagespeed_insights_title'), chrome.i18n.getMessage('tools_pagespeed_insights_description'), 'https://developers.google.com/speed/pagespeed/insights/?url=' + encodeURIComponent(tabUrl)));
	objTableTools.children('tbody').append(GetToolsItem(chrome.i18n.getMessage('tools_w3c_css_validation_title'), chrome.i18n.getMessage('tools_w3c_css_validation_description'), 'https://jigsaw.w3.org/css-validator/validator?uri=' + encodeURIComponent(tabUrl)));
	objTableTools.children('tbody').append(GetToolsItem(chrome.i18n.getMessage('tools_nu_html_checker_title'), chrome.i18n.getMessage('tools_nu_html_checker_description'), 'https://validator.w3.org/nu/?doc=' + encodeURIComponent(tabUrl)));
	objTableTools.children('tbody').append(GetToolsItem(chrome.i18n.getMessage('tools_gtmetrix_title'), chrome.i18n.getMessage('tools_gtmetrix_description'), 'https://gtmetrix.com/?url=' + encodeURIComponent(tabUrl)));
	objTableTools.children('tbody').append(GetToolsItem(chrome.i18n.getMessage('tools_gsc_rich_results_title'), chrome.i18n.getMessage('tools_gsc_rich_results_description'), 'https://search.google.com/test/rich-results?url=' + encodeURIComponent(tabUrl)));
	objTableTools.children('tbody').append(GetToolsItem(chrome.i18n.getMessage('tools_gsc_mobile_friendly_title'), chrome.i18n.getMessage('tools_gsc_mobile_friendly_description'), 'https://search.google.com/test/mobile-friendly?url=' + encodeURIComponent(tabUrl)));
}

/**
 * function to get the tool item to display on the list of the tool view.
 * @param {string} title The title of the tool.
 * @param {string} description The description of the tool.
 * @param {string} link The link to the tool website with website specific parameter.
 */
function GetToolsItem(title, description, link) {
    return '<tr><td><a class="full-link" href="' + link + '" target="_blank"><div class="heading">' + title + '</div><span class="info">' + description + '</span></a></td></tr>';
}

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
			window.scrollTo(0, 0);

        var objTableStylesheet = $('div#view-files table#files-stylesheet');
        var objTableJavaScript = $('div#view-files table#files-javascript');
        var objTableSpecialFiles = $('div#view-files table#files-special');
				let objTableStylesheetDomains = $('div#view-files table#list-files-javascript-domains');
				let objTableJavaScriptDomains = $('div#view-files table#list-files-stylesheet-domains')

        //get the arrays with files.
        var arrStylesheet = objFiles['stylesheet'];
        var arrJavaScript = objFiles['javascript'];

        //remove all rows of the stylesheet and javascript table.
        objTableStylesheet.children('tbody').empty();
        objTableJavaScript.children('tbody').empty();
        objTableSpecialFiles.children('tbody').empty();
				objTableStylesheetDomains.children('tbody').empty();
				objTableJavaScriptDomains.children('tbody').empty();

				let domainsJavaScript = GetDomains(arrJavaScript.map(file => file.url).map(file => file.href));
				let domainsStylesheet = GetDomains(arrStylesheet.map(file => file.url).map(file => file.href));

        //iterate through the stylesheet files and add them to the table.
        for (let indexStylesheet = 0; indexStylesheet < arrStylesheet.length; indexStylesheet++) {
					let htmlMedia = '';

					if (arrStylesheet[indexStylesheet].media.trim() !== '') {
						htmlMedia = '<span class="info"><strong>media: </strong>' + arrStylesheet[indexStylesheet].media + '</span>';
					}

					//add the stylesheet url to the list.
					objTableStylesheet.children('tbody').append('<tr><td id="item-' + indexStylesheet + '"><a href="' + arrStylesheet[indexStylesheet].url.href + '" target="_blank">' + arrStylesheet[indexStylesheet].original + '</a>' + htmlMedia + '</td></tr>');
        }

        //iterate through the javascript files and add them to the table.
        for (let indexJavaScript = 0; indexJavaScript < arrJavaScript.length; indexJavaScript++) {
					let htmlAsync = '';
					let htmlCharset = '';

					if (arrJavaScript[indexJavaScript].is_async === true) {
						htmlAsync = '<span class="info"><strong>async</strong></span>';
					}

					if (arrJavaScript[indexJavaScript].charset) {
						htmlCharset = '<span class="info"><strong>charset: </strong>' + arrJavaScript[indexJavaScript].charset + '</span>';
					}

					//add the javascript url to the list.
					objTableJavaScript.children('tbody').append('<tr><td id="item-' + indexJavaScript + '"><a href="' + arrJavaScript[indexJavaScript].url.href + '" target="_blank">' + arrJavaScript[indexJavaScript].original + '</a>' + htmlAsync + htmlCharset + '</td></tr>');
        }

				for (let domainStylesheet of domainsStylesheet.filter((v, i, a) => a.indexOf(v) === i).sort()) {
					if (domainStylesheet.trim() !== '') {
						$('table#list-files-stylesheet-domains').children('tbody').append('<tr><td>' + domainStylesheet + '</td><td>' + domainsStylesheet.filter(domain => domain === domainStylesheet).length + '</td></tr>');
					}
				}

				for (let domainJavaScript of domainsJavaScript.filter((v, i, a) => a.indexOf(v) === i).sort()) {
					if (domainJavaScript.trim() !== '') {
						$('table#list-files-javascript-domains').children('tbody').append('<tr><td>' + domainJavaScript + '</td><td>' + domainsJavaScript.filter(domain => domain === domainJavaScript).length + '</td></tr>');
					}
				}

        var strSitemapURL = (new URL(tabUrl)).origin + '/sitemap.xml';
        fetch(strSitemapURL).then(function(response) {
            if (response.status == 200) {
                $('div#view-files table#files-special tbody').append('<tr><td id="item-sitemapxml"><a href="' + strSitemapURL + '" target="_blank">sitemap.xml</a></td></tr>');
                SetTableCountOnCardHeader($('#special-heading'), $('table#files-special'));
            }
        });

        var strRobotsURL = (new URL(tabUrl)).origin + '/robots.txt';
        fetch(strRobotsURL).then(function(response) {
            if (response.status == 200) {
                $('div#view-files table#files-special tbody').append('<tr><td id="item-robotstxt"><a href="' + strRobotsURL + '" target="_blank">robots.txt</a></td></tr>');
                SetTableCountOnCardHeader($('#special-heading'), $('table#files-special'));
            }
        });

        //set the count of items to the card header.
        SetTableCountOnCardHeader($('#stylesheet-heading'), $('table#files-stylesheet'));
        SetTableCountOnCardHeader($('#javascript-heading'), $('table#files-javascript'));
    };
}



function GetHyperlinkInfo(link) {
	let strLinkInfo = '';

	if ((link.rel || '').toString().trim() !== '') {
		strLinkInfo = strLinkInfo + '<span class="info"><strong>rel:</strong> ' + link.rel + '</span>';
	}

	if ((link.title || '').toString().trim() !== '') {
		strLinkInfo = strLinkInfo + '<span class="info"><strong>title:</strong> ' + link.title + '</span>';
	}

	return strLinkInfo;
}

function GetAlternateInfo(alternate) {
	let strAlternateInfo = '';

	if ((alternate.title || '').toString().trim() !== '') {
		strAlternateInfo = strAlternateInfo + '<span class="info"><strong>title: </strong>' + alternate.title + '</span>';
	}

	if ((alternate.hreflang || '').toString().trim() !== '') {
		strAlternateInfo = strAlternateInfo + '<span class="info"><strong>hreflang: </strong> ' + alternate.hreflang + '</span>';
	}

	return strAlternateInfo;
}

function GetImageInfo(objImageInfo, strID) {
    let strImageInfo = '';

    if (objImageInfo.alternative !== '') {
        strImageInfo = strImageInfo + '<span class="info"><strong>alt:</strong> ' + objImageInfo.alternative + '</span>';
    }

    if (objImageInfo.title !== '') {
        strImageInfo = strImageInfo + '<span class="info"><strong>title:</strong> ' + objImageInfo.title + '</span>';
    }

    if (objImageInfo.source) {
        let img = new Image;
        img.onload = function() {
            $('tr#' + strID + ' td').append('<span class="info"><strong>size:</strong> ' + img.width + ' x ' + img.height + '</span>');
        };
        img.src = objImageInfo.source;
    }

    return strImageInfo;
}

function GetIconInfo(icon, id) {
	let strIconInfo = '';

	if (icon.type !== '') {
		strIconInfo = strIconInfo + '<span class="info"><strong>type: </strong>' + icon.type + '</span>';
	}

	if (icon.sizes !== '') {
		strIconInfo = strIconInfo + '<span class="info"><strong>sizes: </strong>' + icon.sizes + '</span>';
	}

	if (icon.source) {
		let img = new Image;
		img.onload = function() {
			$('tr#' + id + ' td').append('<span class="info"><strong>size:</strong> ' + img.width + ' x ' + img.height + '</span>');
		};
		img.src = icon.source;
	}

	return strIconInfo;

}




/**
 * View for Headings.
 */
 function ViewHeadings() {

	//get the current / active tab of the current window and send a message
	//to the content script to get the information of the website.
	chrome.tabs.query({active: true, currentWindow: true}, tabs => {
		chrome.tabs.sendMessage(
			tabs[0].id,
			{source: SOURCE.POPUP, subject: SUBJECT.HEADING},
			LoadHeadings
		);
	});

	//the callback function executed by the content script to show heading information.
	const LoadHeadings = info => {
		window.scrollTo(0, 0);

		//get the HTML container of the headings tab.
		const tabHeadings = $('div#view-headings');

		//get the tables to show the headings information.
		const tableHeadings = $('table#list-headings', tabHeadings);
		const tableHeadingsStatistics = $('table#statistics-headings', tabHeadings);
		const tableHeadingsErrors = $('table#headings-errors', tabHeadings);

		//get the headings from the content script.
		const headings = (info.headings || []);

		//remove all rows of the headings table.
		tableHeadings.children('tbody').empty();
		tableHeadingsErrors.children('tbody').empty();

		//reset the filter on the heading tab.
		ResetHeadingFilter();

		//iterate through the different levels of the headings and set the stats.
		for (level = 1; level <= 6; level++) {
			tableHeadingsStatistics.find('td[id="headings-h' + level + '"]').text(headings.filter(heading => heading.type === 'h' + level).length);
			$('td[id="headings-h' + level + '"]').on('click', {'level': level}, CallbackHeadingFilter);
		}

		//set the total count of headings to the table.
		tableHeadingsStatistics.find('td[id="headings-all"]').text(headings.length);

		//add all found headings to the table.
		headings.forEach(function(heading) {
			tableHeadings.children('tbody').append(`<tr class="level-${heading.type} is-empty"><td><span>${heading.type}</span>${heading.text}${GetTextWordInformation(heading.text, true)}</td></tr>`);
		});

		//get the count of heading level 1.
		const cntH1 = headings.filter(heading => heading.type === 'h1').length;

		//check whether there are multiple h1 headings.
		if (cntH1 === 0) {
			tableHeadingsErrors.children('tbody').append('<td><td>There is no H1 heading on this website.</td></tr>');
		} else if (cntH1 > 1) {
			tableHeadingsErrors.children('tbody').append('<tr><td>Multiple H1 headings found on the website.</td></tr>');
		}

		//set the count of found errors and warnings.
		SetTableCountOnCardHeader($('#headings-errors-heading'), tableHeadingsErrors);
	};
}

/**
 * View for Images.
 */
function ViewImages() {

	//get the current / active tab of the current window and send a message
	//to the content script to get the information of the website.
	chrome.tabs.query({active: true, currentWindow: true}, tabs => {
		chrome.tabs.sendMessage(
			tabs[0].id,
			{source: SOURCE.POPUP, subject: SUBJECT.IMAGE},
			LoadImages
		);
	});

	//the callback function executed by the content script to show image information.
	const LoadImages = info => {
		window.scrollTo(0, 0);

		//get the HTML container of the images tab.
		const tabImages = $('div#view-images');

		//get the tables to show the images information.
		const tableImages = $('table#list-images', tabImages);
		const tableImagesStatistics = $('table#statistics-images', tabImages);
		const tableImagesDomains = $('table#list-image-domains', tabImages);
		const tableImagesIcons = $('table#list-image-icons', tabImages);

		//get the images and icons from the content script.
		const images = (info.images || []);
		const icons = (info.icons || []);
		const domains = GetDomains(images.map(image => image.source));

		//remove all rows of the images, icons and domains table.
		tableImages.children('tbody').empty();
		tableImagesIcons.children('tbody').empty();
		tableImagesDomains.children('tbody').empty();

		//set all the images to the table.
		images.filter(image => (image.source || '').toString().trim() !== '').forEach(function(image, index) {
			tableImages.children('tbody').append(`<tr id="img-${index}"><td><a target="_blank" href="${image.source}">${((image.filename) ? image.filename : image.source)}</a>${GetImageInfo(image, 'img-' + index)}</td></tr>`);
			ShowImagePreview($(`tr[id="img-${index}"] td`, tableImages), image.source);
		});

		//set all the domains to the table.
		domains.filter((v, i, a) => a.indexOf(v) === i).sort().forEach(function(domain) {
			tableImagesDomains.children('tbody').append(GetInformationRow(domain, domains.filter(domainItem => domainItem === domain).length));
		});

		//set all the icons to the table.
		icons.filter(icon => (icon.source || '').toString().trim() !== '').forEach(function(icon, index) {
			tableImagesIcons.children('tbody').append(`<tr id="icon-${index}"><td><a target="_blank" href="${icon.source}">${((icon.filename) ? icon.filename : icon.source)}</a>${GetIconInfo(icon, 'icon-' + index)}</td></tr>`);
			ShowImagePreview($(`tr[id="icon-${index}"] td`, tableImagesIcons), icon.source);
		});

		//set hints on empty tables.
		SetEmptyHint(tableImages, 'This website doesn\'t have images.');
		SetEmptyHint(tableImagesDomains, 'This website doesn\'t have images with domains.');
		SetEmptyHint(tableImagesIcons, 'This website doesn\'t have icons.');

		//set the image statistics to the table.
		tableImagesStatistics.find('td[data-seo-info="images-all"]').text(images.length);
		tableImagesStatistics.find('td[data-seo-info="images-without-alt"]').text(images.filter(image => image.alternative === '').length);
		tableImagesStatistics.find('td[data-seo-info="images-without-src"]').text(images.filter(image => image.source === '').length);
		tableImagesStatistics.find('td[data-seo-info="images-without-title"]').text(images.filter(image => image.title === '').length);
	};
}

/**
 * View for Hyperlinks.
 */
function ViewHyperlinks() {

	//get the current / active tab of the current window and send a message
	//to the content script to get the information of the website.
	chrome.tabs.query({active: true, currentWindow: true}, tabs => {
		chrome.tabs.sendMessage(
			tabs[0].id,
			{source: SOURCE.POPUP, subject: SUBJECT.HYPERLINK},
			LoadHyperlinks
		);
	});

	//the callback function executed by the content script to show hyperlink information.
	const LoadHyperlinks = info => {
		window.scrollTo(0, 0);

		//get the HTML container of the hyperlinks tab.
		const tabHyperlinks = $('div#view-hyperlinks');

		//get the tables to show the hyperlinks information.
		const tableHyperlinks = $('table#list-hyperlinks', tabHyperlinks);
		const tableAlternate = $('table#list-hyperlink-alternate', tabHyperlinks);
		const tableHyperlinksStatistics = $('table#statistics-hyperlinks', tabHyperlinks);
		const tableProtocolsStatistics = $('table#statistics-protocols', tabHyperlinks);
		const tableDomains = $('table#list-hyperlink-domains', tabHyperlinks);
		const tablePreload = $('table#list-hyperlink-preload', tabHyperlinks);
		const tableDnsPrefetch = $('table#list-hyperlink-dns-prefetch', tabHyperlinks);
		const tablePreconnect = $('table#list-preconnect', tabHyperlinks);

		//remove all rows of the hyperlinks, preload, preconnect and domains table.
		tableHyperlinks.children('tbody').empty();
		tableAlternate.children('tbody').empty();
		tableDomains.children('tbody').empty();
		tablePreload.children('tbody').empty();
		tableDnsPrefetch.children('tbody').empty();
		tablePreconnect.children('tbody').empty();

		//get the hyperlinks, alternates and other hyperlink related information from the content script.
		const hyperlinks = (info.links || []);
		const alternates = (info.alternate || []);
		const preloads = (info.preload || []);
		const prefetches = (info.dnsprefetch || []);
		const preconnects = (info.preconnect || []);
		const domains = GetDomains(hyperlinks.map(link => link.url).map(link => link.href));

		//set all the hyperlinks to the table.
		hyperlinks.forEach(function(link, index) {
			tableHyperlinks.children('tbody').append(`<tr id="link-${index}"><td><a target="_blank" href="${link.url.href}">${link.url.href}</a>${GetHyperlinkInfo(link)}</td></tr>`);
		});

		//set all the domains to the table.
		domains.filter((v, i, a) => a.indexOf(v) === i).sort().forEach(function(domain) {
			tableDomains.children('tbody').append(GetInformationRow(domain, domains.filter(domainItem => domainItem === domain).length));
		});

		//set all the preloads to the table.
		preloads.forEach(function(preload) {
			tablePreload.children('tbody').append(`<tr><td>${preload.href}</td></tr>`);
		});

		//set all the DNS prefetches to the table.
		prefetches.forEach(function(prefetch) {
			tableDnsPrefetch.children('tbody').append(`<tr><td>${prefetch.href}</td></tr>`);
		});

		//set all the preconnects to the table.
		preconnects.forEach(function(preconnect) {
			tablePreconnect.children('tbody').append(`<tr><td>${preconnect.href}</td></tr>`);
		});

		//set all the alternates to the table.
		alternates.forEach(function(alternate) {
			tableAlternate.children('tbody').append(`<tr><td><a href="${alternate.href}" target="_blank">${alternate.href}</a>${GetAlternateInfo(alternate)}</td></tr>`);
		});

		//set hints on empty tables.
		SetEmptyHint(tableHyperlinks, 'This website doesn\'t have hyperlinks.');
		SetEmptyHint(tableAlternate, 'This website doesn\'t have alternate links.');
		SetEmptyHint(tableDomains, 'This website doesn\'t have hyperlinks with domains.');
		SetEmptyHint(tablePreconnect, 'This website doesn\'t have preconnect items.');
		SetEmptyHint(tableDnsPrefetch, 'This website doesn\'t have DNS prefetch items.');
		SetEmptyHint(tablePreload, 'This website doesn\'t have preload items.');

		//set the statistics for the hyperlinks.
		tableHyperlinksStatistics.find('td[data-seo-info="hyperlinks-all"]').text(hyperlinks.map(link => link.count).reduce((a, b) => a + b, 0));
		tableHyperlinksStatistics.find('td[data-seo-info="hyperlinks-all-unique"]').text(hyperlinks.length);
		tableHyperlinksStatistics.find('td[data-seo-info="hyperlinks-internal"]').text(hyperlinks.filter(link => link.internal === true).map(link => link.count).reduce((a, b)=> a + b, 0));
		tableHyperlinksStatistics.find('td[data-seo-info="hyperlinks-internal-unique"]').text(hyperlinks.filter(link => link.internal === true).length);
		tableHyperlinksStatistics.find('td[data-seo-info="hyperlinks-external"]').text(hyperlinks.filter(link => link.internal === false).map(link => link.count).reduce((a, b)=> a + b, 0));
		tableHyperlinksStatistics.find('td[data-seo-info="hyperlinks-external-unique"]').text(hyperlinks.filter(link => link.internal === false).length);

		//set the statistics for the protocols of the hyperlinks.
		tableProtocolsStatistics.find('td[data-seo-info="hyperlinks-protocol-http"]').text(hyperlinks.filter(link => link.url.protocol === 'http').map(link => link.count).reduce((a, b)=> a + b, 0));
		tableProtocolsStatistics.find('td[data-seo-info="hyperlinks-protocol-https"]').text(hyperlinks.filter(link => link.url.protocol === 'https').map(link => link.count).reduce((a, b)=> a + b, 0));
		tableProtocolsStatistics.find('td[data-seo-info="hyperlinks-protocol-mailto"]').text(hyperlinks.filter(link => link.url.protocol === 'mailto').map(link => link.count).reduce((a, b)=> a + b, 0));
		tableProtocolsStatistics.find('td[data-seo-info="hyperlinks-protocol-javascript"]').text(hyperlinks.filter(link => link.url.protocol === 'javascript').map(link => link.count).reduce((a, b)=> a + b, 0));
		tableProtocolsStatistics.find('td[data-seo-info="hyperlinks-protocol-whatsapp"]').text(hyperlinks.filter(link => link.url.protocol === 'whatsapp').map(link => link.count).reduce((a, b)=> a + b, 0));
		tableProtocolsStatistics.find('td[data-seo-info="hyperlinks-protocol-tel"]').text(hyperlinks.filter(link => link.url.protocol === 'tel').map(link => link.count).reduce((a, b) => a + b, 0));
	};
}
