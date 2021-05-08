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
			ViewSummary();
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

/**
 * Sets the image information as additional information.
 * @param {object} html The HTML object to append the image information.
 * @param {string} source The url of the image to get the information from.
 */
function SetImageInfo(html, source) {
	let image = new Image;
	image.onload = function() {
		html.append(GetInformation('size', (image.width + ' x ' + image.height)));
	};
	image.src = source;
}

/**
 * Returns the HTML element with the additional information.
 * @param {string} label The label value (displayed in bold letters) used on the additional information.
 * @param {string} value The value used on the additional information.
 * @returns The HTML element with the additional information.
 */
function GetInformation(label, value) {

	//normalize the label and value.
	const strLabel = (label || '').toString().trim();
	const strValue = (value || '').toString().trim();

	//the format of the additional information depends on the available label and / or value.
	if (strLabel !== '' && strValue !== '') {
		return `<span class="info"><strong>${strLabel}:</strong>${strValue}</span>`;
	} else if (strLabel !== '') {
		return `<span class="info"><strong>${strLabel}</strong></span>`;
	} else if (strValue !== '') {
		return `<span class="info">${strValue}</span>`;
	} else {
		return '';
	}
}

/**
 * Returns a tool item to display on the list of the tool view.
 * @param {string} title The title of the tool.
 * @param {string} description The description of the tool.
 * @param {string} link The link to the tool website with website specific parameter.
 */
function GetToolsItem(title, description, link) {
	return `<tr><td><a class="full-link" href="${link}" target="_blank"><div class="heading">${title}</div><span class="info">${description}</span></a></td></tr>`;
}



function GetTextWordInformation(strValue, newLine = false) {
    strValue = (strValue || '').toString().trim();

    //don't create information for empty string values.
    if (strValue.length === 0) {
        return '';
    }

    //return the tags with information.
    return ((newLine === true) ? '<br>' : '') + GetInformation('', strValue.length + ' ' + chrome.i18n.getMessage('chars')) + GetInformation('', GetWordCount(strValue) + ' ' + chrome.i18n.getMessage('words'));
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
    if (metaValue === tabUrl) {
        return GetInformationRow(metaName + '<br>' + GetInformation('', 'self-referential'), EscapeHTML(metaValue));
    } else {
        return GetInformationRow(metaName, EscapeHTML(metaValue));
    }
}

/**
 * Initialize the extension on load (register events, translate extension).
 */
jQuery(function() {

	//translate all placeholder of the extension.
	TranslateHTML();

	//only register the events if the extension can be used.
	if ($('body').hasClass('not-supported') === false) {
		$('a[href="#view-summary"]').on('click', ViewSummary);
		$('a[href="#view-meta-details"]').on('click', ViewMetaDetails);
		$('a[href="#view-headings"]').on('click', ViewHeadings);
    $('a[href="#view-images"]').on('click', ViewImages);
		$('a[href="#view-hyperlinks"]').on('click', ViewHyperlinks);
		$('a[href="#view-files"]').on('click', ViewFiles);
		$('a[href="#view-headers"]').on('click', ViewHeader);
		$('a[href="#view-tools"]').on('click', ViewTools);
	}
});

/**
 * View for Meta.
 */
function ViewMetaDetails() {

	//get the current / active tab of the current window and send a message
	//to the content script to get the information from website.
	chrome.tabs.query({active: true, currentWindow: true}, tabs => {
		chrome.tabs.sendMessage(
			tabs[0].id,
			{source: SOURCE.POPUP, subject: SUBJECT.META},
			LoadMetaDetails
		);
	});

	//the callback function executed by the content script to show meta information.
	const LoadMetaDetails = info => {
		window.scrollTo(0, 0);

		//get the HTML container of the meta tab.
		const tabMetaDetails = $('div#view-meta-details');

		//get the table to show the meta information.
		const tableOthers = $('table#meta-details-others', tabMetaDetails);
		const tableOpenGraphBasic = $('table#meta-details-opengraph-basic', tabMetaDetails);
		const tableOpenGraphArticle = $('table#meta-details-opengraph-article', tabMetaDetails);
		const tableOpenGraphAudio = $('table#meta-details-opengraph-audio', tabMetaDetails);
		const tableOpenGraphBook = $('table#meta-details-opengraph-book', tabMetaDetails);
		const tableOpenGraphImage = $('table#meta-details-opengraph-image', tabMetaDetails);
		const tableOpenGraphProfile = $('table#meta-details-opengraph-profile', tabMetaDetails);
		const tableOpenGraphVideo = $('table#meta-details-opengraph-video', tabMetaDetails);
		const tableFacebook = $('table#meta-details-facebook', tabMetaDetails);
		const tableParsely = $('table#meta-details-parsely', tabMetaDetails);
		const tableTwitter = $('table#meta-details-twitter', tabMetaDetails);
		const tableDublinCore = $('table#meta-details-dublin-core', tabMetaDetails);
		const tableErrorDetails = $('table#meta-details-errors', tabMetaDetails);

		//remove all rows of all meta tables.
		$('table[id^=meta-details-]').children('tbody').empty();

		//get all the meta information from the content script.
		const itemsFacebook = (info.facebook || []);
		const itemsOpenGraphBasic = (info.opengraph.basic || []);
		const itemsOpenGraphArticle = (info.opengraph.article || []);
		const itemsOpenGraphAudio = (info.opengraph.audio || []);
		const itemsOpenGraphBook = (info.opengraph.book || []);
		const itemsOpenGraphImage = (info.opengraph.image || []);
		const itemsOpenGraphProfile = (info.opengraph.profile || []);
		const itemsOpenGraphVideo = (info.opengraph.video || []);
		const itemsOthers = (info.others || []);
		const itemsParsely = (info.parsely || []);
		const itemsTwitter = (info.twitter || []);
		const itemsDublinCore = (info.dublinecore || []);

		//set the arrays with the meta elements to show additional information.
		const itemsDetailedInfoOpenGraph = ['og:title', 'og:description'];
		const itemsDetailedInfoTwitter = ['twitter:title', 'twitter:description', 'twitter:image:alt'];

		//set OpenGraph basic information to the table.
		itemsOpenGraphBasic.forEach(function(item, index) {
			const value = (item.value || '').toString().trim();

			//some information can be displayed with additional information.
			if (itemsDetailedInfoOpenGraph.includes(item.name)) {
				tableOpenGraphBasic.children('tbody').append(GetInformationRow(item.name + GetTextWordInformation(value, true), EscapeHTML(value), 'id', 'og-basic-' + index));
			} else {
				tableOpenGraphBasic.children('tbody').append(GetInformationRow(item.name, EscapeHTML(value), 'id', 'og-basic-' + index));
			}

			//on image information, a image preview is possible.
			if (item.name === 'og:image') {
				ShowImagePreview(tableOpenGraphBasic.find('tbody tr#og-basic-' + index), new URL(value, tabUrlOrigin));
			}
		});

		//set OpenGraph article information to the table.
		itemsOpenGraphArticle.forEach(function(item) {
			tableOpenGraphArticle.children('tbody').append(GetInformationRow(item.name, EscapeHTML((item.value || '').toString().trim())));
		});

		//set OpenGraph audio information to the table.
		itemsOpenGraphAudio.forEach(function(item) {
			tableOpenGraphAudio.children('tbody').append(GetInformationRow(item.name, EscapeHTML((item.value || '').toString().trim())));
		});

		//set OpenGraph book information to the table.
		itemsOpenGraphBook.forEach(function(item) {
			tableOpenGraphBook.children('tbody').append(GetInformationRow(item.name, EscapeHTML((item.value || '').toString().trim())));
		});

		//set OpenGraph image information to the table.
		itemsOpenGraphImage.forEach(function(item, index) {
			const value = (item.value || '').toString().trim();
			tableOpenGraphImage.children('tbody').append(GetInformationRow(item.name, EscapeHTML(value), 'id', 'og-image-' + index));

			//on image information, a image preview is possible.
			if (item.name === 'og:image:url') {
				ShowImagePreview(tableOpenGraphImage.find('tbody tr#og-image-' + index + ' td'), new URL(value, tabUrlOrigin));
			}
		});

		//set OpenGraph profile information to the table.
		itemsOpenGraphProfile.forEach(function(item) {
			tableOpenGraphProfile.children('tbody').append(GetInformationRow(item.name, EscapeHTML((item.value || '').toString().trim())));
		});

		//set OpenGraph video information to the table.
		itemsOpenGraphVideo.forEach(function(item) {
			tableOpenGraphVideo.children('tbody').append(GetInformationRow(item.name, EscapeHTML((item.value || '').toString().trim())));
		});

		//set Facebook information to the table.
		itemsFacebook.forEach(function(item) {
			tableFacebook.children('tbody').append(GetInformationRow(item.name, EscapeHTML((item.value || '').toString().trim())));
		});

		//set Parsely information to the table.
		itemsParsely.forEach(function(item) {
			tableParsely.children('tbody').append(GetInformationRow(item.name, EscapeHTML((item.value || '').toString().trim())));
		});

		//set Dublin Core information to the table.
		itemsDublinCore.forEach(function(item) {
			tableDublinCore.children('tbody').append(GetInformationRow(item.name,((item.value || '').toString().trim())));
		});

		//set Twitter information to the table.
		itemsTwitter.forEach(function(item, index) {
			const value = (item.value || '').toString().trim();

			//some information can be displayed with additional information.
			if (itemsDetailedInfoTwitter.includes(item.name)) {
				tableTwitter.children('tbody').append(GetInformationRow(item.name + GetTextWordInformation(value, true),EscapeHTML(value), 'id', 'twitter-' + index));
			} else {
				tableTwitter.children('tbody').append(GetInformationRow(item.name, EscapeHTML(value), 'id', 'twitter-' + index));
			}

			//on image information, a image preview is possible.
			if (item.name === 'twitter:image') {
				ShowImagePreview(tableTwitter.find('tbody tr#twitter-' + index + ' td'), new URL(value, tabUrlOrigin));
			}
		});

		//set other meta tags (not found above) to the table.
		itemsOthers.forEach(function(item, index) {
			const value = (item.value || '').toString().trim();

			//depending on the name of the meta property display the value.
			switch (item.name.toLowerCase()) {
				case 'msapplication-tilecolor':
					tableOthers.children('tbody').append(GetColorRow(item.name, value));
					break;
				default:
					tableOthers.children('tbody').append(GetInformationRow(item.name, EscapeHTML(value), 'id', 'others-' + index));
					break;
			}

			//on image information, a image preview is possible.
			if (item.name.toLowerCase() === 'msapplication-tileimage') {
				ShowImagePreview(tableOthers.find('tbody tr#others-' + index + ' td'), new URL(value, tabUrlOrigin));
			}
		});

		//check for errors (missing meta tags) on the meta information.
		if (Object.keys(itemsOpenGraphBasic).length > 0) {

			//The four required properties for every page are: og:title, og:type, og:image, og:url
			//https://ogp.me/
			for (itemRequiredOpenGraph of ['og:title', 'og:type', 'og:image', 'og:url']) {
				if (itemsOpenGraphBasic.filter(infoOpenGraph => infoOpenGraph.name === itemRequiredOpenGraph).length === 0) {
					tableErrorDetails.children('tbody').append('<tr><td>Missing required Open Graph information: ' + itemRequiredOpenGraph + '.</td></tr>');
				}
			}
		}

		//now all lists are created so it is possible to count the items of each list.
		SetTableCountOnCardHeader($('#meta-details-opengraph-heading'), $('div#meta-details-opengraph-content'));
		SetTableCountOnCardHeader($('#meta-opengraph-basic-heading'), tableOpenGraphBasic);
		SetTableCountOnCardHeader($('#meta-opengraph-article-heading'), tableOpenGraphArticle);
		SetTableCountOnCardHeader($('#meta-opengraph-audio-heading'), tableOpenGraphAudio);
		SetTableCountOnCardHeader($('#meta-opengraph-book-heading'), tableOpenGraphBook);
		SetTableCountOnCardHeader($('#meta-opengraph-image-heading'), tableOpenGraphImage);
		SetTableCountOnCardHeader($('#meta-opengraph-profile-heading'), tableOpenGraphProfile);
		SetTableCountOnCardHeader($('#meta-opengraph-video-heading'), tableOpenGraphVideo);
		SetTableCountOnCardHeader($('#meta-details-facebook-heading'), tableFacebook);
		SetTableCountOnCardHeader($('#meta-details-twitter-heading'), tableTwitter);
		SetTableCountOnCardHeader($('#meta-details-dublin-core-heading'), tableDublinCore);
		SetTableCountOnCardHeader($('#meta-details-parsely-heading'), tableParsely);
		SetTableCountOnCardHeader($('#meta-details-others-heading'), tableOthers);
		SetTableCountOnCardHeader($('#meta-details-errors-heading'), tableErrorDetails);
	}
}

/**
 * View for Summary.
 */
function ViewSummary() {

	//get the current / active tab of the current window and send a message
	//to the content script to get the information from website.
	chrome.tabs.query({active: true, currentWindow: true}, tabs => {
		chrome.tabs.sendMessage(
			tabs[0].id,
			{source: SOURCE.POPUP, subject: SUBJECT.SUMMARY},
			LoadSummary
		);
	});

	//the callback function executed by the content script to show summary information.
	const LoadSummary = info => {
		window.scrollTo(0, 0);

		//get the HTML container of the summary tab.
		const tabSummary = $('div#view-summary');

		//get the table to show the summary information.
		const tableSummary = $('table#meta-head-info', tabSummary);

		//remove all rows of the summary table.
		tableSummary.children('tbody').empty();

		//get the meta information from the content script.
		const metas = (info.meta || []);

		//get a specific order of the meta information.
		//the important information have to be visible on top of the list.
		const metaOrder = ['title', 'description', 'robots'];
		const metasDisplay = (metas.filter(meta => metaOrder.indexOf(meta.name) > -1).sort((a, b) => metaOrder.indexOf(a.name) - metaOrder.indexOf(b.name)) || []).concat((metas.filter(meta => metaOrder.indexOf(meta.name) === -1) || []));

		//set all the meta information to the table.
		metasDisplay.forEach(function(meta) {
			switch (meta.name) {
				case 'canonical':
					tableSummary.children('tbody').append(GetCanonicalRow(meta.name, meta.value));
					break;
				case 'theme-color':
					tableSummary.children('tbody').append(GetColorRow(meta.name, meta.value));
					break;
				default:
					tableSummary.children('tbody').append(GetDefaultRow(meta.name, meta.value));
					break;
			}
		});
	};
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
			LoadFiles
		);
	});

	//the callback function executed by the content script to show files information.
	const LoadFiles = info => {
		window.scrollTo(0, 0);

		//get the HTML container of the files tab.
		const tabFiles = $('div#view-files');

		//get the tables to show the files information.
		const tableFilesStylesheet = $('table#files-stylesheet', tabFiles);
		const tableFilesJavaScript = $('table#files-javascript', tabFiles);
		const tableFilesSpecial = $('table#files-special', tabFiles);
		const tableStylesheetDomains = $('table#list-files-stylesheet-domains', tabFiles);
		const tableJavaScriptDomains = $('table#list-files-javascript-domains', tabFiles);

		//get the files from the content script.
		const filesStylesheet = (info.stylesheet || []);
		const filesJavaScript = (info.javascript || []);
		const domainsStylesheet = GetDomains(filesStylesheet.map(file => file.url.href));
		const domainsJavaScript = GetDomains(filesJavaScript.map(file => file.url.href));

		//remove all rows of the files tables.
		tableFilesStylesheet.children('tbody').empty();
		tableFilesJavaScript.children('tbody').empty();
		tableFilesSpecial.children('tbody').empty();
		tableStylesheetDomains.children('tbody').empty();
		tableJavaScriptDomains.children('tbody').empty();

		//set all stylesheets to the table.
		filesStylesheet.forEach(function(file, index) {
			tableFilesStylesheet.children('tbody').append(`<tr id="stylesheet-${index}"><td><a href="${file.url.href}" target="_blank">${file.original}</a></td></tr>`);

			//check whether the media property exists and add the additional information.
			if (file.media.trim() !== '') {
				tableFilesStylesheet.find('tbody > tr#stylesheet-' + index + ' td').append(GetInformation('media', file.media.trim()));
			}
		});

		//set all JavaScript files to the table.
		filesJavaScript.forEach(function(file, index) {
			tableFilesJavaScript.children('tbody').append(`<tr id="javascript-${index}"><td><a href="${file.url.href}" target="_blank">${file.original}</a></td></tr>`);

			//check whether the async property exists and add the additional information.
			if (file.async === true) {
				tableFilesJavaScript.find('tbody tr#javascript-' + index + ' td').append(GetInformation('async'));
			}

			//check whether the charset property exists and add the additional information.
			if (file.charset) {
				tableFilesJavaScript.find('tbody tr#javascript-' + index + ' td').append(GetInformation('charset', file.charset.trim()));
			}
		});

		//set all the stylesheet domains to the table.
		domainsStylesheet.filter((v, i, a) => a.indexOf(v) === i).filter(domain => domain.trim() !== '').sort().forEach(function(domain) {
			tableStylesheetDomains.children('tbody').append(GetInformationRow(domain, domainsStylesheet.filter(domainItem => domainItem === domain).length));
		});

		//set all the JavaScript domains to the table.
		domainsJavaScript.filter((v, i, a) => a.indexOf(v) === i).filter(domain => domain.trim() !== '').sort().forEach(function(domain) {
			tableJavaScriptDomains.children('tbody').append(GetInformationRow(domain, domainsJavaScript.filter(domainItem => domainItem === domain).length));
		});

		//create an array with all special files.
		let filesSpecial = [];
		filesSpecial.push((new URL(tabUrl)).origin + '/sitemap.xml');
		filesSpecial.push((new URL(tabUrl)).origin + '/robots.txt');

		//check for the special files and add to the table if available.
		filesSpecial.forEach(function(file, index) {
			fetch(file).then(function(response) {
				if (response.status == 200) {
					tableFilesSpecial.children('tbody').append(`<tr id="special-${index}"><td><a href="${file}" target="_blank">${file}</a></td></tr>`);
					SetTableCountOnCardHeader($('#special-heading'), tableFilesSpecial);
				}
			});
		});

		//set the count of rows / items to the card header.
		SetTableCountOnCardHeader($('#stylesheet-heading'), tableFilesStylesheet);
		SetTableCountOnCardHeader($('#javascript-heading'), tableFilesJavaScript);
		SetTableCountOnCardHeader($('#special-heading'), tableFilesSpecial);
	};
}

/**
 * View for Header.
 */
function ViewHeader() {
	window.scrollTo(0, 0);

	//get the tab and table of the headers list.
	const tabHeaders = $('div#view-headers');
	const tableHeaders = $('table#info-headers', tabHeaders);

	//remove all available header information.
	tableHeaders.children('tbody').empty();

	//fetch the header information of the current url.
	fetch(tabUrl).then(function(response) {

		//set every information of the header to the table.
		for (let header of response.headers.entries()) {
			tableHeaders.children('tbody').append(GetInformationRow(header[0], header[1]));
		}

		//set the status of the response to the table.
		tableHeaders.children('tbody').append(GetInformationRow('HTTP Status', response.status));
		tableHeaders.children('tbody').append(GetInformationRow('HTTP Version', response.statusText.trim() === '' ? 'HTTP/2' : 'HTTP/1'));
	});
}

/**
 * View for Tools.
 */
function ViewTools() {
	window.scrollTo(0, 0);

	//get the tab and table of the tools list.
	const tabTools = $('div#view-tools');
  const tableTools = $('table#info-tools', tabTools);

	//remove all available tools.
	tableTools.children('tbody').empty();

	//get the encoded url to set on a url as parameter.
	const encodedUrl = encodeURIComponent(tabUrl);

	//add the tool "Page Speed Insights" to the table.
	tableTools.children('tbody').append(GetToolsItem(
		chrome.i18n.getMessage('tools_pagespeed_insights_title'),
		chrome.i18n.getMessage('tools_pagespeed_insights_description'),
		'https://developers.google.com/speed/pagespeed/insights/?url=' + encodedUrl
	));

	//add the tool "W3C CSS Validation" to the table.
	tableTools.children('tbody').append(GetToolsItem(
		chrome.i18n.getMessage('tools_w3c_css_validation_title'),
		chrome.i18n.getMessage('tools_w3c_css_validation_description'),
		'https://jigsaw.w3.org/css-validator/validator?uri=' + encodedUrl
	));

	//add the tool "Nu HTML checker" to the table.
	tableTools.children('tbody').append(GetToolsItem(
		chrome.i18n.getMessage('tools_nu_html_checker_title'),
		chrome.i18n.getMessage('tools_nu_html_checker_description'),
		'https://validator.w3.org/nu/?doc=' + encodedUrl
	));

	//add the tool "GTmetrix" to the table.
	tableTools.children('tbody').append(GetToolsItem(
		chrome.i18n.getMessage('tools_gtmetrix_title'),
		chrome.i18n.getMessage('tools_gtmetrix_description'),
		'https://gtmetrix.com/?url=' + encodedUrl
	));

	//add the tool "Google Search Console Rich Result Test" to the table.
	tableTools.children('tbody').append(GetToolsItem(
		chrome.i18n.getMessage('tools_gsc_rich_results_title'),
		chrome.i18n.getMessage('tools_gsc_rich_results_description'),
		'https://search.google.com/test/rich-results?url=' + encodedUrl
	));

	//add the tool "Google Search Console Mobile Friendly Test" to the table.
	tableTools.children('tbody').append(GetToolsItem(
		chrome.i18n.getMessage('tools_gsc_mobile_friendly_title'),
		chrome.i18n.getMessage('tools_gsc_mobile_friendly_description'),
		'https://search.google.com/test/mobile-friendly?url=' + encodedUrl
	));
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
			tableImages.children('tbody').append(`<tr id="img-${index}"><td><a target="_blank" href="${image.source}">${((image.filename) ? image.filename : image.source)}</a></td></tr>`);
			ShowImagePreview($(`tr[id="img-${index}"] td`, tableImages), image.source);

			//check whether the alt property exists and add the additional information.
			if ((image.alternative || '').toString().trim() !== '') {
				tableImages.find('tbody tr#img-' + index + ' td').append(GetInformation('alt', (image.alternative || '').toString().trim()));
			}

			//check whether the title property exists and add the additional information.
			if ((image.title || '').toString().trim() !== '') {
				tableImages.find('tbody tr#img-' + index + ' td').append(GetInformation('title', (image.title || '').toString().trim()));
    	}

			//set the image information of the image itself.
			SetImageInfo(tableImages.find('tbody tr#img-' + index + ' td'), image.source);
		});

		//set all the domains to the table.
		domains.filter((v, i, a) => a.indexOf(v) === i).sort().forEach(function(domain) {
			tableImagesDomains.children('tbody').append(GetInformationRow(domain, domains.filter(domainItem => domainItem === domain).length));
		});

		//set all the icons to the table.
		icons.filter(icon => (icon.source || '').toString().trim() !== '').forEach(function(icon, index) {
			tableImagesIcons.children('tbody').append(`<tr id="icon-${index}"><td><a target="_blank" href="${icon.source}">${((icon.filename) ? icon.filename : icon.source)}</a></td></tr>`);
			ShowImagePreview($(`tr[id="icon-${index}"] td`, tableImagesIcons), icon.source);

			//check whether the type property exists and add the additional information.
			if ((icon.type || '').toString().trim() !== '') {
				tableImagesIcons.find('tbody tr#icon-' + index + ' td').append(GetInformation('type', (icon.type || '').toString().trim()));
			}

			//check whether the type property exists and add the additional information.
			if ((icon.sizes || '').toString().trim() !== '') {
				tableImagesIcons.find('tbody tr#icon-' + index + ' td').append(GetInformation('sizes', (icon.sizes || '').toString().trim()));
			}

			//set the image information of the icon itself.
			SetImageInfo(tableImagesIcons.find('tbody tr#icon-' + index + ' td'), icon.source)
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
			tableHyperlinks.children('tbody').append(`<tr id="link-${index}"><td><a target="_blank" href="${link.url.href}">${link.url.href}</a></td></tr>`);

			//check whether the rel property exists and add the additional information.
			if ((link.rel || '').toString().trim() !== '') {
				tableHyperlinks.find('tbody tr#link-' + index + ' td').append(GetInformation('rel', (link.rel || '').toString().trim()));
			}

			//check whether the title property exists and add the additional information.
			if ((link.title || '').toString().trim() !== '') {
				tableHyperlinks.find('tbody tr#link-' + index + ' td').append(GetInformation('title', (link.title || '').toString().trim()));
			}
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
		alternates.forEach(function(alternate, index) {
			tableAlternate.children('tbody').append(`<tr id="alternate-${index}"><td><a href="${alternate.href}" target="_blank">${alternate.href}</a></td></tr>`);

			//check whether the title property exists and add the additional information.
			if ((alternate.title || '').toString().trim() !== '') {
				tableAlternate.find('tbody tr#alternate-' + index + ' td').append(GetInformation('title', (alternate.title || '').toString().trim()));
			}

			//check whether the hreflang property exists and add the addtional information.
			if ((alternate.hreflang || '').toString().trim() !== '') {
				tableAlternate.find('tbody tr#alternate-' + index + ' td').append(GetInformation('hreflang', (alternate.hreflang || '').toString().trim()));
			}
		});

		//set hints on empty tables.
		SetEmptyHint(tableHyperlinks, 'This website doesn\'t have hyperlinks.');
		SetEmptyHint(tableAlternate, 'This website doesn\'t have alternate links.');
		SetEmptyHint(tableDomains, 'This website doesn\'t have hyperlinks with domains.');
		SetEmptyHint(tablePreconnect, 'This website doesn\'t have preconnect items.');
		SetEmptyHint(tableDnsPrefetch, 'This website doesn\'t have DNS prefetch items.');
		SetEmptyHint(tablePreload, 'This website doesn\'t have preload items.');

		//set the statistics for the hyperlinks.
		tableHyperlinksStatistics.find('td[data-seo-info="hyperlinks-all"]').text(hyperlinks.length);
		tableHyperlinksStatistics.find('td[data-seo-info="hyperlinks-all-unique"]').text(hyperlinks.map(link => link.url.href).filter((v, i, a) => a.indexOf(v) === i).length);
		tableHyperlinksStatistics.find('td[data-seo-info="hyperlinks-internal"]').text(hyperlinks.filter(link => link.url.href.startsWith(tabUrlOrigin) === true).length);
		tableHyperlinksStatistics.find('td[data-seo-info="hyperlinks-internal-unique"]').text(hyperlinks.filter(link => link.url.href.startsWith(tabUrlOrigin) === true).map(link => link.url.href).filter((v, i, a) => a.indexOf(v) === i).length);
		tableHyperlinksStatistics.find('td[data-seo-info="hyperlinks-external"]').text(hyperlinks.filter(link => link.url.href.startsWith(tabUrlOrigin) === false).length);
		tableHyperlinksStatistics.find('td[data-seo-info="hyperlinks-external-unique"]').text(hyperlinks.filter(link => link.url.href.startsWith(tabUrlOrigin) === false).map(link => link.url.href).filter((v, i, a) => a.indexOf(v) === i).length);

		//set the statistics for the protocols of the hyperlinks.
		tableProtocolsStatistics.find('td[data-seo-info="hyperlinks-protocol-http"]').text(hyperlinks.filter(link => link.url.protocol === 'http').length);
		tableProtocolsStatistics.find('td[data-seo-info="hyperlinks-protocol-https"]').text(hyperlinks.filter(link => link.url.protocol === 'https').length);
		tableProtocolsStatistics.find('td[data-seo-info="hyperlinks-protocol-mailto"]').text(hyperlinks.filter(link => link.url.protocol === 'mailto').length);
		tableProtocolsStatistics.find('td[data-seo-info="hyperlinks-protocol-javascript"]').text(hyperlinks.filter(link => link.url.protocol === 'javascript').length);
		tableProtocolsStatistics.find('td[data-seo-info="hyperlinks-protocol-whatsapp"]').text(hyperlinks.filter(link => link.url.protocol === 'whatsapp').length);
		tableProtocolsStatistics.find('td[data-seo-info="hyperlinks-protocol-tel"]').text(hyperlinks.filter(link => link.url.protocol === 'tel').length);
	};
}
