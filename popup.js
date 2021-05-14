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
	if (tab.url.startsWith('https://chrome.google.com')) {
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
	const count = $(table).find('tr').length;
	const cardHeaderButton = $(cardHeader).find('button');

	//first remove the info on the HTML element.
	$('span.badge', cardHeaderButton).remove();

	//set the count of items to the card header.
	$(cardHeaderButton).append(`<span class="badge ${count > 0 ? 'bg-info' : 'bg-secondary'} ms-auto me-3 rounded-0">${count} ${chrome.i18n.getMessage('items')}</span>`);
	$(cardHeaderButton).prop('disabled', (count === 0));

	//hide all accordion items if there are no items.
	if (count === 0) {
		$(cardHeaderButton).parent().parent().hide();
	} else {
		$(cardHeaderButton).parent().parent().show();
	}
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
		table.children('tbody').append(`<tr class="empty-alert"><td><div class="alert alert-primary rounded-0" role="alert">${hint}</div></td></tr>`);
	}
}

/**
 * Sets a hint to a empty tab as placeholder / additional information.
 * @param {object} tab The HTML object of the tab.
 * @param {string} hint The hint to be shown on the empty tab.
 */
function SetEmptyHintOnTabAccordion(tab, hint) {
	if ($('div.accordion-item table tbody', tab).children().length === 0) {
		$('div.alert.empty-alert', tab).remove();
		$(tab).append('<div class="alert alert-primary empty-alert rounded-0" role="alert">' + chrome.i18n.getMessage('no_file_items') + '</div>');
	} else {
		$('div.alert.empty-alert', tab).remove();
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
		html.append(GetInformation('size', (image.width + 'x' + image.height)));
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
 * Returns the state whether the given value is a HEX color.
 * @param {string} value The value to check for a HEX color.
 * @returns State if the given value is a HEX color.
 */
function IsColorHEX(value) {
	return (value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i) !== null);
}

/**
 * Returns the state whether the given value is a RGB / RGBA color.
 * @param {string} value The value to check for a RGB / RGBA color.
 * @returns State if the given value is a RGB / RGBA color.
 */
function IsColorRGB(value) {
	return (value.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?(,[\s+]?\d?\.?\d+)?[\s+]?\)$/i) !== null);
}

/**
 * Returns the state whether the given value is a color value.
 * @param {string} value The value to check for a color value.
 * @returns State if the given value is a color value.
 */
function IsColor(value) {
	return (IsColorHEX(value) || IsColorRGB(value));
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

/**
 * Returns a string value with leadings zeros and the expected length.
 * @param {string} str The string value padded with zeros.
 * @param {integer} length The resulting string length after padding.
 * @returns The string value padded with zeros to the expected length.
 */
 function PadZero(str, length) {
	length = length || 2;
	const zeros = new Array(length).join('0');
	return (zeros + str).slice(-length);
}

/**
 * Returns the inverted value of a given HEX value.
 * @param {string} hexValue The HEX value to be inverted.
 * @param {*} useBlackWhite State whether the HEX value should be inverted to black or white.
 * @returns The color value of the inverted HEX value.
 * @see https://stackoverflow.com/a/35970186/3840840
 */
function InvertColor(hexValue, useBlackWhite) {

	//remove the hash of the hex value.
	if (hexValue.indexOf('#') === 0) {
		hexValue = hexValue.slice(1);
	}

	//convert the 3-digit hex value to 6-digits.
	if (hexValue.length === 3) {
		hexValue = hexValue[0] + hexValue[0] + hexValue[1] + hexValue[1] + hexValue[2] + hexValue[2];
	}

	//check whether the hex value is valid.
	if (hexValue.length !== 6) {
		return null;
	}

	//get the red, green and blue part of the color.
	let r = parseInt(hexValue.slice(0, 2), 16);
	let g = parseInt(hexValue.slice(2, 4), 16);
	let b = parseInt(hexValue.slice(4, 6), 16);

	//it is possible to invert to black or white.
	//https://stackoverflow.com/a/3943023/3840840
	if (useBlackWhite) {
		return (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? '#000000' : '#FFFFFF';
	}

	//invert the red, green and blue value.
	r = (255 - r).toString(16);
	g = (255 - g).toString(16);
	b = (255 - b).toString(16);

	//pad each color component with zeros and return the hex value.
	return "#" + PadZero(r) + PadZero(g) + PadZero(b);
}

/**
 * Returns the HEX value of the given RGB or RGBA value.
 * @param {string} rgb The RGB / RGBA value to convert.
 * @returns The HEX value of the given RGB / RGBA value.
 */
function RGBtoHEX(rgb) {
	rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
	return (rgb && rgb.length === 4) ? "#" +
		("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
	 	("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
	 	("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}

/**
 * Returns the count of words in a given string value.
 * @param {string} str The string value to get the count of words from.
 * @returns The count of words in the given string value.
 * @see https://stackoverflow.com/a/30335883/3840840
 */
function GetWordCount(str) {
	str = str.replace(/(^\s*)|(\s*$)/gi, '');  // remove starting and ending spaces.
	str = str.replace(/-\s/gi, ''); // replace word-break with empty string to get one word.
	str = str.replace(/\s/gi, ' ');  // replace all spaces, tabs and new lines with a space.
	str = str.replace(/\s{2,}/gi, ' '); // replace two ore more spaces with a single space.
	return str.split(' ').filter(str => str.match(/[0-9a-z\u00C0-\u017F]/gi)).length;
}

/**
 * Returns a escaped string of the given string to also display HTML specific chars on HTML.
 * @param {string} str The string value to be escaped.
 * @returns The escaped string value to display HTML specific chars on HTML.
 */
function EscapeHTML(str) {
	return String(str).replace(/[&<>"'\/]/g, function(s) {
		return {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': '&quot;',
			"'": '&#39;',
			"/": '&#x2F;'
		}[s];
	});
}

/**
 * Returns a color value as HTML element.
 * @param {string} value The color value to format.
 * @returns The formatted color value as HTML element.
 */
function GetFormattedColorValue(value) {
	const textColor = (value.toLocaleLowerCase().startsWith('rgb')) ? RGBtoHEX(value) : value;
	return `<div class="theme-color" style="background: ${value}; color: ${InvertColor(textColor, true)}">${value}</div>`;
}

/**
 * Returns the chars and words count as HTML element.
 * @param {string} value The value to count the chars and words.
 * @param {*} newLine State whether the tags should be displayed on a new line.
 * @returns The chars and words count of the given value formatted in a HTML element.
 */
function GetTextWordInformation(value, newLine = false) {
	value = (value || '').toString().trim();

	//don't create information for empty string values.
	if (value.length === 0) {
		return '';
	}

	//return the count of chars and word as additional information.
	return ((newLine === true) ? '<br>' : '') + GetInformation('', value.length + ' ' + chrome.i18n.getMessage('chars')) + GetInformation('', GetWordCount(value) + ' ' + chrome.i18n.getMessage('words'));
}

/**
 * Returns the row to add in a table. It is possible to add a marker.
 * @param {string} name The name to be displayed on the first column of the row.
 * @param {string} value The value to be displayed on the second column of the row.
 * @param {*} markerName The property name to mark the row (used to access the exactly same row later).
 * @param {*} markerValue The property value to mark the row (used to access the exactly same row later).
 * @returns The row containing the information in two column. There is also a marker for later access if given.
 */
function GetInformationRow(name, value, markerName, markerValue) {
	const namesInfoDetailed = ['title', 'description', 'og:description', 'og:title', 'twitter:description', 'twitter:title', 'twitter:image:alt'];
	let info = '';

	//get the additional information on specific information.
	if (namesInfoDetailed.includes(name)) {
		info = GetTextWordInformation(value, true);
	}

	//return a new information row with or without the row marker.
	if (markerName && markerValue) {
		return `<tr ${markerName}="${markerValue}"><td>${name} ${info}</td><td>${value}</td></tr>`;
	} else {
		return `<tr><td>${name} ${info}</td><td>${value}</td></tr>`;
	}
}

/**
 * Initialize the extension on load (register events, translate extension).
 */
jQuery(function() {
	$.fx.off = true;

	//translate all placeholder of the extension.
	TranslateHTML();

	//only register the events if the extension can be used.
	if ($('body').hasClass('not-supported') === false) {
		$('button#view-summary-tab').on('click', ViewSummary);
		$('button#view-meta-details-tab').on('click', ViewMetaDetails);
		$('button#view-headings-tab').on('click', ViewHeadings);
    $('button#view-images-tab').on('click', ViewImages);
		$('button#view-hyperlinks-tab').on('click', ViewHyperlinks);
		$('button#view-files-tab').on('click', ViewFiles);
		$('button#view-headers-tab').on('click', ViewHeader);
		$('button#view-tools-tab').on('click', ViewTools);
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
			{info: INFO.META},
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

		//set OpenGraph basic information to the table.
		itemsOpenGraphBasic.forEach(function(item, index) {
			const value = (item.value || '').toString().trim();

			//some information can be displayed with additional information.
			tableOpenGraphBasic.children('tbody').append(GetInformationRow(item.name, EscapeHTML(value), 'id', 'og-basic-' + index));
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
			if (['og:image', 'og:image:url', 'og:image:secure_url'].includes(item.name.toLowerCase())) {
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
			tableTwitter.children('tbody').append(GetInformationRow(item.name, EscapeHTML(value), 'id', 'twitter-' + index));

			//on image information, a image preview is possible.
			if (item.name === 'twitter:image') {
				ShowImagePreview(tableTwitter.find('tbody tr#twitter-' + index + ' td'), new URL(value, tabUrlOrigin));
			}
		});

		//set other meta tags (not found above) to the table.
		itemsOthers.forEach(function(item, index) {
			const value = (item.value || '').toString().trim();

			//depending on the value of the meta property format the value.
			if (IsColor(value)) {
				tableOthers.children('tbody').append(GetInformationRow(item.name, GetFormattedColorValue(value)));
			} else {
				tableOthers.children('tbody').append(GetInformationRow(item.name, EscapeHTML(value), 'id', 'others-' + index));
			}

			//on image information, a image preview is possible.
			if (['twitter:image:src', 'msapplication-tileimage'].includes(item.name.toLowerCase())) {
				ShowImagePreview(tableOthers.find('tbody tr#others-' + index + ' td'), new URL(value, tabUrlOrigin));
			}
		});

		//now all lists are created so it is possible to count the items of each list.
		SetTableCountOnCardHeader($('#meta-details-opengraph-basic-heading'), tableOpenGraphBasic);
		SetTableCountOnCardHeader($('#meta-details-opengraph-article-heading'), tableOpenGraphArticle);
		SetTableCountOnCardHeader($('#meta-details-opengraph-audio-heading'), tableOpenGraphAudio);
		SetTableCountOnCardHeader($('#meta-details-opengraph-book-heading'), tableOpenGraphBook);
		SetTableCountOnCardHeader($('#meta-details-opengraph-image-heading'), tableOpenGraphImage);
		SetTableCountOnCardHeader($('#meta-details-opengraph-profile-heading'), tableOpenGraphProfile);
		SetTableCountOnCardHeader($('#meta-details-opengraph-video-heading'), tableOpenGraphVideo);
		SetTableCountOnCardHeader($('#meta-details-facebook-heading'), tableFacebook);
		SetTableCountOnCardHeader($('#meta-details-twitter-heading'), tableTwitter);
		SetTableCountOnCardHeader($('#meta-details-dublincore-heading'), tableDublinCore);
		SetTableCountOnCardHeader($('#meta-details-parsely-heading'), tableParsely);
		SetTableCountOnCardHeader($('#meta-details-others-heading'), tableOthers);

		//display a hint if there are no meta elements (no accordions).
		SetEmptyHintOnTabAccordion($('div#view-meta-details'), chrome.i18n.getMessage('no_meta_items'));
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
			{info: INFO.SUMMARY},
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

		//iterate through all meta items to set on table with specific formatting and information if needed.
		metasDisplay.map(meta => meta.name).filter((v, i, a) => a.indexOf(v) === i).forEach(function(name) {
			const items = metasDisplay.filter(meta => meta.name === name);

			//check how many items are available. on multiple values display the values as list.
			if (items.length === 1) {
				if (name === 'canonical') {
					tableSummary.children('tbody').append(GetInformationRow(name + (items[0].value === tabUrl ? '<span class="info d-block">self-referential</span>' : ''), items[0].value));
				} else {
					if (IsColor(items[0].value)) {
						tableSummary.children('tbody').append(GetInformationRow(name, GetFormattedColorValue(items[0].value)));
					} else {
						tableSummary.children('tbody').append(GetInformationRow(name, items[0].value));
					}
				}
			} else if (items.length > 1) {
				if (name === 'theme-color') {
					tableSummary.children('tbody').append('<tr><td>' + name + '</td><td>' + items.map(metaItem => GetFormattedColorValue(metaItem.value)).join('') + '</td></tr>');
				} else {
					tableSummary.children('tbody').append('<tr><td>' + name + '</td><td><ul><li>' + items.map(metaItem => metaItem.value).join('</li><li>') + '</li></ul></td></tr>');
				}
			}
		});

		//if there are no items display a hint.
		SetEmptyHint(tableSummary, chrome.i18n.getMessage('no_summary_items'));
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
			{info: INFO.FILES},
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

					//display a hint if there are no meta elements (no accordions).
					SetEmptyHintOnTabAccordion($('div#view-files'), chrome.i18n.getMessage('no_file_items'));
				}
			});
		});

		//set the count of rows / items to the card header.
		SetTableCountOnCardHeader($('#stylesheet-heading'), tableFilesStylesheet);
		SetTableCountOnCardHeader($('#javascript-heading'), tableFilesJavaScript);
		SetTableCountOnCardHeader($('#special-heading'), tableFilesSpecial);

		//display a hint if there are no meta elements (no accordions).
		SetEmptyHintOnTabAccordion($('div#view-files'), chrome.i18n.getMessage('no_file_items'));
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
			{info: INFO.HEADINGS},
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
		const tableHeadingsStatistics = $('table#heading-stats', tabHeadings);
		const tableHeadingsErrors = $('table#list-headings-errors', tabHeadings);

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

		//set a hint if there are no headings on the website.
		SetEmptyHint(tableHeadings, chrome.i18n.getMessage('no_heading_items'));

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
			{info: INFO.IMAGES},
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
		const tableImagesStatistics = $('table#image-stats', tabImages);
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
			tableImages.children('tbody').append(`<tr id="img-${index}"><td><a target="_blank" href="${image.source}">${image.src}</a></td></tr>`);
			ShowImagePreview($(`tbody tr#img-${index} td`, tableImages), image.source);

			//set the attribute information to the row.
			for (let attribute of ['alt', 'title']) {
				if ((image[attribute] || '').toString().trim() !== '') {
					tableImages.find(`tbody tr#img-${index} td`).append(GetInformation('alt', (image[attribute] || '').toString().trim()));
				}
			}

			//set the image information of the image itself.
			SetImageInfo(tableImages.find(`tbody tr#img-${index} td`), image.source);
		});

		//set all the domains to the table.
		domains.filter((v, i, a) => a.indexOf(v) === i).sort().forEach(function(domain) {
			tableImagesDomains.children('tbody').append(GetInformationRow(domain, domains.filter(domainItem => domainItem === domain).length));
		});

		//set all the icons to the table.
		icons.filter(icon => (icon.href || '').toString().trim() !== '').forEach(function(icon, index) {
			tableImagesIcons.children('tbody').append(`<tr id="icon-${index}"><td><a target="_blank" href="${icon.source}">${icon.href}</a></td></tr>`);
			ShowImagePreview($(`tr#icon-${index} td`, tableImagesIcons), icon.source);

			//set the attribute information to the row.
			for (let attribute of ['type', 'sizes']) {
				if ((icon[attribute] || '').toString().trim() !== '') {
					tableImagesIcons.find(`tbody tr#icon-${index} td`).append(GetInformation('type', (icon[attribute] || '').toString().trim()));
				}
			}

			//set the image information of the icon itself.
			SetImageInfo(tableImagesIcons.find(`tbody tr#icon-${index} td`), icon.source)
		});

		//set hints on empty tables.
		SetEmptyHint(tableImages, chrome.i18n.getMessage('no_items', chrome.i18n.getMessage('images_lc')));
		SetEmptyHint(tableImagesDomains, chrome.i18n.getMessage('no_domain_items', chrome.i18n.getMessage('images_lc')));
		SetEmptyHint(tableImagesIcons, chrome.i18n.getMessage('no_items', chrome.i18n.getMessage('icons_lc')));

		//set the image statistics to the table.
		tableImagesStatistics.find('td[id="image-stats-all"]').text(images.length);

		//get the count of the attributes to check.
		const cntWithoutAlt = images.filter(image => image.alt === '').length;
		const cntWithoutSrc = images.filter(image => image.src === '').length;
		const cntWithoutTitle = images.filter(image => image.title === '').length;

		//get the fields of the attributes to check.
		const fieldWithoutAlt = tableImagesStatistics.find('td[id="image-stats-without-alt"]');
		const fieldWithoutSrc = tableImagesStatistics.find('td[id="image-stats-without-src"]');
		const fieldWithoutTitle = tableImagesStatistics.find('td[id="image-stats-without-title"]');

		//set the count of the attributes to the fields and format the value based on the count.
		fieldWithoutAlt.text(cntWithoutAlt).removeClass('text-danger fw-bold').addClass(cntWithoutAlt > 0 ? 'text-danger fw-bold' : '');
		fieldWithoutSrc.text(cntWithoutSrc).removeClass('text-danger fw-bold').addClass(cntWithoutSrc > 0 ? 'text-danger fw-bold' : '');
		fieldWithoutTitle.text(cntWithoutTitle).removeClass('text-danger fw-bold').addClass(cntWithoutTitle > 0 ? 'text-danger fw-bold' : '');
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
			{info: INFO.LINKS},
			LoadHyperlinks
		);
	});

	//the callback function executed by the content script to show hyperlink information.
	const LoadHyperlinks = info => {
		window.scrollTo(0, 0);

		//get the HTML container of the hyperlinks tab.
		const tabHyperlinks = $('div#view-hyperlinks');

		//get the table objects to organize the content.
		const tableHyperlinks = $('table#list-hyperlink', tabHyperlinks);
		const tableAlternate = $('table#list-alternate', tabHyperlinks);
		const tableHyperlinksStatistics = $('table#hyperlink-stats', tabHyperlinks);
		const tableProtocolsStatistics = $('table#hyperlink-protocol-stats', tabHyperlinks);
		const tableAttributesStatistics = $('table#hyperlink-attribute-stats', tabHyperlinks);
		const tableDomains = $('table#list-hyperlink-domain', tabHyperlinks);
		const tablePreload = $('table#list-preload', tabHyperlinks);
		const tableDnsPrefetch = $('table#list-dns-prefetch', tabHyperlinks);
		const tablePreconnect = $('table#list-preconnect', tabHyperlinks);

		//remove all rows of the tables.
		tableHyperlinks.children('tbody').empty();
		tableAlternate.children('tbody').empty();
		tableDomains.children('tbody').empty();
		tablePreload.children('tbody').empty();
		tableDnsPrefetch.children('tbody').empty();
		tablePreconnect.children('tbody').empty();

		//get the information from the content script.
		const hyperlinks = (info.links || []);
		const alternates = (info.alternate || []);
		const preloads = (info.preload || []);
		const prefetches = (info.dnsprefetch || []);
		const preconnects = (info.preconnect || []);
		const domains = GetDomains(hyperlinks.map(link => link.url.href));

		//set all the hyperlinks with href value to the table.
		//don't show the hyperlinks with empty href attribute.
		hyperlinks.filter(hyperlink => hyperlink.href !== '').forEach(function(hyperlink, index) {
			tableHyperlinks.children('tbody').append(`<tr id="link-${index}"><td><a target="_blank" href="${hyperlink.url.href}">${hyperlink.href}</a></td></tr>`);

			//set the attribute information to the row.
			for (let attribute of ['rel', 'target', 'title']) {
				if ((hyperlink[attribute] || '').toString().trim() !== '') {
					tableHyperlinks.find('tbody tr#link-' + index + ' td').append(GetInformation(attribute, (hyperlink[attribute] || '').toString().trim()));
				}
			}
		});

		//set all the hyperlink domains to the table.
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

			//set the attribute information to the row.
			for (let attribute of ['title', 'hreflang']) {
				if ((alternates[attribute] || '').toString().trim() !== '') {
					tableAlternate.find('tbody tr#alternate-' + index + ' td').append(GetInformation(attribute, (alternates[attribute] || '').toString().trim()));
				}
			}
		});

		//set hints on empty tables.
		SetEmptyHint(tableHyperlinks, chrome.i18n.getMessage('no_items', chrome.i18n.getMessage('links_lc')));
		SetEmptyHint(tableAlternate, chrome.i18n.getMessage('no_alternate_items'));
		SetEmptyHint(tableDomains, chrome.i18n.getMessage('no_domain_items', chrome.i18n.getMessage('links_lc')));
		SetEmptyHint(tablePreconnect, chrome.i18n.getMessage('no_preconnect_items'));
		SetEmptyHint(tableDnsPrefetch, chrome.i18n.getMessage('no_dns_prefetch_items'));
		SetEmptyHint(tablePreload, chrome.i18n.getMessage('no_preload_items'));

		//set the statistics for the hyperlinks.
		tableHyperlinksStatistics.find('td[id="hyperlink-stats-all"]').text(hyperlinks.length);
		tableHyperlinksStatistics.find('td[id="hyperlink-stats-all-unique"]').text(hyperlinks.map(link => link.url.href).filter((v, i, a) => a.indexOf(v) === i).length);
		tableHyperlinksStatistics.find('td[id="hyperlink-stats-internal"]').text(hyperlinks.filter(link => link.url.href.startsWith(tabUrlOrigin) === true).length);
		tableHyperlinksStatistics.find('td[id="hyperlink-stats-internal-unique"]').text(hyperlinks.filter(link => link.url.href.startsWith(tabUrlOrigin) === true).map(link => link.url.href).filter((v, i, a) => a.indexOf(v) === i).length);
		tableHyperlinksStatistics.find('td[id="hyperlink-stats-external"]').text(hyperlinks.filter(link => link.url.href.startsWith(tabUrlOrigin) === false).length);
		tableHyperlinksStatistics.find('td[id="hyperlink-stats-external-unique"]').text(hyperlinks.filter(link => link.url.href.startsWith(tabUrlOrigin) === false).map(link => link.url.href).filter((v, i, a) => a.indexOf(v) === i).length);

		//set the statistics for the attributes.
		//get the count of the attributes to check.
		const cntWithoutTitle = hyperlinks.filter(link => link.title === '').length;
		const cntWithoutHref = hyperlinks.filter(link => link.href === '').length;

		//get the fields of the attributes to check.
		const fieldHyperlinkTitle = tableAttributesStatistics.find('td[id="hyperlink-attribute-stats-without-title"]');
		const fieldHyperlinkHref = tableAttributesStatistics.find('td[id="hyperlink-attribute-stats-without-href"]');

		//set the count to the fields and format the count based on the value.
		fieldHyperlinkTitle.text(cntWithoutTitle).removeClass('text-danger fw-bold').addClass(cntWithoutTitle > 0 ? 'text-danger fw-bold' : '');
		fieldHyperlinkHref.text(cntWithoutHref).removeClass('text-danger fw-bold').addClass(cntWithoutHref > 0 ? 'text-danger fw-bold' : '');

		//set the statistics for the protocols of the hyperlinks.
		tableProtocolsStatistics.find('td[id="hyperlink-protocol-stats-http"]').text(hyperlinks.filter(link => link.url.protocol === 'http').length);
		tableProtocolsStatistics.find('td[id="hyperlink-protocol-stats-https"]').text(hyperlinks.filter(link => link.url.protocol === 'https').length);
		tableProtocolsStatistics.find('td[id="hyperlink-protocol-stats-mailto"]').text(hyperlinks.filter(link => link.url.protocol === 'mailto').length);
		tableProtocolsStatistics.find('td[id="hyperlink-protocol-stats-javascript"]').text(hyperlinks.filter(link => link.url.protocol === 'javascript').length);
		tableProtocolsStatistics.find('td[id="hyperlink-protocol-stats-whatsapp"]').text(hyperlinks.filter(link => link.url.protocol === 'whatsapp').length);
		tableProtocolsStatistics.find('td[id="hyperlink-protocol-stats-tel"]').text(hyperlinks.filter(link => link.url.protocol === 'tel').length);
		tableProtocolsStatistics.find('td[id="hyperlink-protocol-stats-others"]').text(hyperlinks.filter(link => ['http', 'https', 'mailto', 'javascript', 'whatsapp', 'tel'].includes(link.url.protocol) === false && link.href !== '').length);
	};
}
