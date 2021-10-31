// common information about the website.
let tabUrl = '';
let tabUrlOrigin = '';
const storeId = 'nlkopdpfkbifcibdoecnfabipofhnoom';

// start the chrome extension and inject the scripts to the website.
// the injected scripts are used to get the needed information about the website.
(function() {
	chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
		const tab = tabs[0];

		// set the common information about the website.
		tabUrl = decodeURI(tab.url);
		tabUrlOrigin = decodeURI((new URL(tab.url)).origin);

		// check whether it is possible to inject a content script to the current tab.
		// there are some protocols and sites where no content script can be injected.
		if (!CanInjectContentScript(tab)) {
			$('body').addClass('not-supported');
			return false;
		} else {
			$('body').removeClass('not-supported');
		}

		// programmatically inject the content scripts to the current tab.
		chrome.scripting.executeScript({files: ['libs/jquery-3.6.0.min.js'], target: {tabId: tab.id}});
		chrome.scripting.executeScript({files: ['scripts/helper.js'], target: {tabId: tab.id}});
		chrome.scripting.executeScript({files: ['scripts/meta.js'], target: {tabId: tab.id}});
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

	// it is not possible to inject content scripts to the chrome webstore.
	if (tab.url.startsWith('https://chrome.google.com')) {
		return false;
	}

	// it is possible to inject content scripts to url's with HTTP / HTTPS.
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

	// first remove the info on the HTML element.
	$('span.badge', cardHeaderButton).remove();

	// set the count of items to the card header.
	$(cardHeaderButton).append(`<span class="badge ${count > 0 ? 'bg-info' : 'bg-secondary'} ms-auto me-3 rounded-0">${count} ${chrome.i18n.getMessage('items')}</span>`);
	$(cardHeaderButton).prop('disabled', (count === 0));

	// hide all accordion items if there are no items.
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

	// don't use the filter on not existing elements.
	if ($(this).text() === '0') {
		return;
	}

	// toggle the filter depending on filter state.
	if ($(`tr.level-h${event.data.level}`).is(':hidden')) {
		$(`tr.level-h${event.data.level}`).show();
		$(this).css('color', '#000');
	} else {
		$(`tr.level-h${event.data.level}`).hide();
		$(this).css('color', '#ccc');
	}
}

/**
 * Shows an image when hover a specific HTML element.
 * @param {object} hoverItem The HTML element to bind the hover event to.
 * @param {string} imgUrl The image path to show on the image preview.
 */
function ShowImagePreview(hoverItem, imgUrl) {
	$(hoverItem).on('mouseenter', function() {
		$('div.img-preview', hoverItem).remove();
		$(hoverItem).append(`<div class="img-preview"><img src="${imgUrl}"></div>`);
	}).on('mouseleave', function() {
		$('div.img-preview', hoverItem).remove();
	});
}

/**
 * Returns all domains of the given urls.
 * @param {Array<string>} urls An array with all urls to get the domains from.
 * @returns {Array<string>} An array with all domains of the given urls.
 */
function GetDomains(urls) {
	let domains = [];

	// run through all urls to get the domain from.
	urls.filter(url => (url || '').toString().trim() !== '').forEach(function(url) {
		const domain = (new URL(url, tabUrlOrigin).host || '').toString().trim();

		// only add existing domains. don't add empty domains..
		if (domain !== '') {
			domains.push(domain);
		}
	});

	// return all found domains of the urls.
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
		$(tab).append(`<div class="alert alert-primary empty-alert rounded-0" role="alert">${hint}</div>`);
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
		html.append(GetInformation('size', `${image.width} x ${image.height}`));
	};
	image.src = source;
}

/**
 * Returns the HTML element with the additional information.
 * @param {string} label The label value (displayed in bold letters) used on the additional information.
 * @param {string} value The value used on the additional information.
 * @returns {string} The HTML element with the additional information.
 */
function GetInformation(label, value) {

	// normalize the label and value.
	const strLabel = (label || '').toString().trim();
	const strValue = (value || '').toString().trim();

	// the format of the additional information depends on the available label and / or value.
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
 * @returns {boolean} State whether the given value is a HEX color.
 */
function IsColorHEX(value) {
	return (value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i) !== null);
}

/**
 * Returns the state whether the given value is a RGB / RGBA color.
 * @param {string} value The value to check for a RGB / RGBA color.
 * @returns {boolean} State whether the given value is a RGB / RGBA color.
 */
function IsColorRGB(value) {
	return (value.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?(,[\s+]?\d?\.?\d+)?[\s+]?\)$/i) !== null);
}

/**
 * Returns the state whether the given value is a color keyword.
 * @param {string} value The value to check for a color keyword.
 * @returns {boolean} State whether the given value is a color keyword.
 */
function IsColorKeyword(value) {
	return Object.keys(GetColorKeywords()).includes(value.toLowerCase());
}

/**
 * Returns the state whether the given value is a color value.
 * @param {string} value The value to check for a color value.
 * @returns {boolean} State whether the given value is a color value.
 */
function IsColor(value) {
	return (IsColorHEX(value) || IsColorRGB(value) || IsColorKeyword(value));
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
 * @returns {string} The string value padded with zeros to the expected length.
 */
function PadZero(str, length) {
	length = length || 2;
	const zeros = new Array(length).join('0');
	return (zeros + str).slice(-length);
}

/**
 * Returns the given as value or list depending of the count of values.
 * @param {Array<string>} values The values to be formatted.
 * @returns {string} A single value or a list of values to display on the extension.
 */
function GetFormattedArrayValue(values) {
	if (values.length > 1) {
		return `<ul><li>${values.join('</li><li>')}</li></ul>`;
	} else if (values.length == 1) {
		return values[0];
	} else {
		return '';
	}
}

/**
 * Returns the inverted value of a given HEX value.
 * @param {string} hexValue The HEX value to be inverted.
 * @param {boolean} useBlackWhite State whether the HEX value should be inverted to black or white.
 * @returns {string} The color value of the inverted HEX value.
 * @see https://stackoverflow.com/a/35970186/3840840
 */
function InvertColor(hexValue, useBlackWhite) {

	// remove the hash of the hex value.
	if (hexValue.indexOf('#') === 0) {
		hexValue = hexValue.slice(1);
	}

	// convert the 3-digit hex value to 6-digits.
	if (hexValue.length === 3) {
		hexValue = hexValue[0] + hexValue[0] + hexValue[1] + hexValue[1] + hexValue[2] + hexValue[2];
	}

	// check whether the hex value is valid.
	if (hexValue.length !== 6) {
		return null;
	}

	// get the red, green and blue part of the color.
	let r = parseInt(hexValue.slice(0, 2), 16);
	let g = parseInt(hexValue.slice(2, 4), 16);
	let b = parseInt(hexValue.slice(4, 6), 16);

	// it is possible to invert to black or white.
	// https://stackoverflow.com/a/3943023/3840840
	if (useBlackWhite) {
		return (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? '#000000' : '#FFFFFF';
	}

	// invert the red, green and blue value.
	r = (255 - r).toString(16);
	g = (255 - g).toString(16);
	b = (255 - b).toString(16);

	// pad each color component with zeros and return the hex value.
	return `#${PadZero(r)}${PadZero(g)}${PadZero(b)}`;
}

/**
 * Returns the HEX value of the given RGB or RGBA value.
 * @param {string} rgb The RGB / RGBA value to convert.
 * @returns {string} The HEX value of the given RGB / RGBA value.
 */
function RGBtoHEX(rgb) {
	rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
	return (rgb && rgb.length === 4) ? "#" +
		("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
	 	("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
	 	("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';
}

/**
 * Returns the count of words in a given string value.
 * @param {string} text The string value to get the count of words from.
 * @returns {integer} The count of words in the given string value.
 * @see https://stackoverflow.com/a/18679657/3840840
 */
function GetWordCount(text) {
	text = text.replace(/(^\s*)|(\s*$)/gi, ''); // remove all starting and ending spaces.
	text = text.replace(/-\s/gi, ''); // remove dash with empty string to detect the two parts as single word.
	text = text.replace(/\s/gi, ' '); // replace all space characters with a single space char.
	text = text.replace(/\s{2,}/gi, ' '); // replace multiple space characters with a single char.

	// now split the text by space and get only the items without special chars.
	return text.split(' ').filter(word => word.match(/[0-9a-z\u00C0-\u017F]/gi)).length;
}

/**
 * Returns the count of emojis in a given string value.
 * @param {string} text The string value to get the count of emojis from.
 * @returns {integer} The count of emojis in the given string value.
 * @see https://mathiasbynens.be/notes/es-unicode-property-escapes#emoji
 */
function GetEmojiCount(text) {
	return (text.match(/\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation}|\p{So}|\p{Emoji}\uFE0F/gu) || []).length;
}

/**
 * Returns the information of the text of a given string value.
 * @param {string} text The string value to get the text information from.
 * @returns {object} The object with information of the given string info.
 */
function GetTextInformation(text) {
	return {
		'chars': ReplaceCharactersHTML(text).length,
		'words': GetWordCount(ReplaceCharactersHTML(text)),
		'emojis': GetEmojiCount(text)
	};
}

/**
 * Returns a string with all HTML characters replaced to the real characters.
 * @param {string} str The string value to replace all HTML characters to real characters.
 * @returns {string} The string with all replaced HTML characters.
 */
function ReplaceCharactersHTML(str) {
	return String(str).replace(/&#*([^&#;]+);/g, function(match, s) {
		if (isNaN(s)) {
			return {
				"amp": "&",
				"lt": "<",
				"gt": ">",
				"quot": '"',
				"x2F": "/"
			}[s];
		} else {
			return String.fromCharCode(s);
		}
	});
}

/**
 * Returns a escaped string of the given string to also display HTML specific chars on HTML.
 * @param {string} str The string value to be escaped.
 * @returns {string} The escaped string value to display HTML specific chars on HTML.
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
 * Returns all available color keywords and their hex value.
 * @returns {object} An object with all color keywords and their hex value.
 * @see https://drafts.csswg.org/css-color-3/#svg-color
 */
function GetColorKeywords() {
	return {
		'aliceblue': 'f0f8ff',
		'antiquewhite': 'faebd7',
		'aqua': '00ffff',
		'aquamarine': '7fffd4',
		'azure': 'f0ffff',
		'beige': 'f5f5dc',
		'bisque': 'ffe4c4',
		'black': '000000',
		'blanchedalmond': 'ffebcd',
		'blue': '0000ff',
		'blueviolet': '8a2be2',
		'brown': 'a52a2a',
		'burlywood': 'deb887',
		'cadetblue': '5f9ea0',
		'chartreuse': '7fff00',
		'chocolate': 'd2691e',
		'coral': 'ff7f50',
		'cornflowerblue': '6495ed',
		'cornsilk': 'fff8dc',
		'crimson': 'dc143c',
		'cyan': '00ffff',
		'darkblue': '00008b',
		'darkcyan': '008b8b',
		'darkgoldenrod': 'b8860b',
		'darkgray': 'a9a9a9',
		'darkgreen': '006400',
		'darkgrey': 'a9a9a9',
		'darkkhaki': 'bdb76b',
		'darkmagenta': '8b008b',
		'darkolivegreen': '556b2f',
		'darkorange': 'ff8c00',
		'darkorchid': '9932cc',
		'darkred': '8b0000',
		'darksalmon': 'e9967a',
		'darkseagreen': '8fbc8f',
		'darkslateblue': '483d8b',
		'darkslategray': '2f4f4f',
		'darkslategrey': '2f4f4f',
		'darkturquoise': '00ced1',
		'darkviolet': '9400d3',
		'deeppink': 'ff1493',
		'deepskyblue': '00bfff',
		'dimgray': '696969',
		'dimgrey': '696969',
		'dodgerblue': '1e90ff',
		'firebrick': 'b22222',
		'floralwhite': 'fffaf0',
		'forestgreen': '228b22',
		'fuchsia': 'ff00ff',
		'gainsboro': 'dcdcdc',
		'ghostwhite': 'f8f8ff',
		'gold': 'ffd700',
		'goldenrod': 'daa520',
		'gray': '808080',
		'green': '008000',
		'greenyellow': 'adff2f',
		'grey': '808080',
		'honeydew': 'f0fff0',
		'hotpink': 'ff69b4',
		'indianred': 'cd5c5c',
		'indigo': '4b0082',
		'ivory': 'fffff0',
		'khaki': 'f0e68c',
		'lavender': 'e6e6fa',
		'lavenderblush': 'fff0f5',
		'lawngreen': '7cfc00',
		'lemonchiffon': 'fffacd',
		'lightblue': 'add8e6',
		'lightcoral': 'f08080',
		'lightcyan': 'e0ffff',
		'lightgoldenrodyellow': 'fafad2',
		'lightgray': 'd3d3d3',
		'lightgreen': '90ee90',
		'lightgrey': 'd3d3d3',
		'lightpink': 'ffb6c1',
		'lightsalmon': 'ffa07a',
		'lightseagreen': '20b2aa',
		'lightskyblue': '87cefa',
		'lightslategray': '778899',
		'lightslategrey': '778899',
		'lightsteelblue': 'b0c4de',
		'lightyellow': 'ffffe0',
		'lime': '00ff00',
		'limegreen': '32cd32',
		'linen': 'faf0e6',
		'magenta': 'ff00ff',
		'maroon': '800000',
		'mediumaquamarine': '66cdaa',
		'mediumblue': '0000cd',
		'mediumorchid': 'ba55d3',
		'mediumpurple': '9370db',
		'mediumseagreen': '3cb371',
		'mediumslateblue': '7b68ee',
		'mediumspringgreen': '00fa9a',
		'mediumturquoise': '48d1cc',
		'mediumvioletred': 'c71585',
		'midnightblue': '191970',
		'mintcream': 'f5fffa',
		'mistyrose': 'ffe4e1',
		'moccasin': 'ffe4b5',
		'navajowhite': 'ffdead',
		'navy': '000080',
		'oldlace': 'fdf5e6',
		'olive': '808000',
		'olivedrab': '6b8e23',
		'orange': 'ffa500',
		'orangered': 'ff4500',
		'orchid': 'da70d6',
		'palegoldenrod': 'eee8aa',
		'palegreen': '98fb98',
		'paleturquoise': 'afeeee',
		'palevioletred': 'db7093',
		'papayawhip': 'ffefd5',
		'peachpuff': 'ffdab9',
		'peru': 'cd853f',
		'pink': 'ffc0cb',
		'plum': 'dda0dd',
		'powderblue': 'b0e0e6',
		'purple': '800080',
		'red': 'ff0000',
		'rosybrown': 'bc8f8f',
		'royalblue': '4169e1',
		'saddlebrown': '8b4513',
		'salmon': 'fa8072',
		'sandybrown': 'f4a460',
		'seagreen': '2e8b57',
		'seashell': 'fff5ee',
		'sienna': 'a0522d',
		'silver': 'c0c0c0',
		'skyblue': '87ceeb',
		'slateblue': '6a5acd',
		'slategray': '708090',
		'slategrey': '708090',
		'snow': 'fffafa',
		'springgreen': '00ff7f',
		'steelblue': '4682b4',
		'tan': 'd2b48c',
		'teal': '008080',
		'thistle': 'd8bfd8',
		'tomato': 'ff6347',
		'turquoise': '40e0d0',
		'violet': 'ee82ee',
		'wheat': 'f5deb3',
		'white': 'ffffff',
		'whitesmoke': 'f5f5f5',
		'yellow': 'ffff00',
		'yellowgreen': '9acd32'
	};
}

/**
 * Returns a color value as HTML element.
 * @param {string} value The color value to format.
 * @returns {string} The formatted color value as HTML element.
 */
function GetFormattedColorValue(value) {
	const textColor = (IsColorKeyword(value)) ? GetColorKeywords()[value.toLowerCase()] : ((value.toLowerCase().startsWith('rgb')) ? RGBtoHEX(value) : value);
	return `<div class="theme-color" style="background: ${value}; color: ${InvertColor(textColor, true)}">${value}</div>`;
}

/**
 * Returns the formatted text information of a given text.
 * @param {string} text The text to get the formatted text information from.
 * @param {boolean} newline State whether the tags should be displayed on a new line.
 * @returns {string} The formatted text information of the given text.
 */
function GetTextWordInformation(text, newline = false) {
	text = (text || '').toString().trim();

	// don't get the text information of a empty string value.
	if (text.length === 0) {
		return '';
	}

	// get the text information of the given text.
	const info = GetTextInformation(text);

	// return the formatted text information.
	// display the count of emojis only if there are emojis.
	return ((newline === true) ? '<br>' : '')
		+ GetInformation('', `${info.chars} ${chrome.i18n.getMessage('chars')}`)
		+ GetInformation('', `${info.words} ${chrome.i18n.getMessage('words')}`)
		+ ((info.emojis > 0) ? GetInformation('', `${info.emojis} ${chrome.i18n.getMessage('emojis')}`) : '');
}

/**
 * Returns the row to add in a table. It is possible to add a marker.
 * @param {string} name The name to be displayed on the first column of the row.
 * @param {string} value The value to be displayed on the second column of the row.
 * @param {string} markerName The property name to mark the row (used to access the exactly same row later).
 * @param {string} markerValue The property value to mark the row (used to access the exactly same row later).
 * @param {boolean} isHtmlValue The state whether the value is formatted with HTML (so don't escape the value).
 * @returns {string} The row containing the information in two column. There is also a marker for later access if given.
 */
function GetInformationRow(name, value, markerName, markerValue, isHtmlValue = false) {
	const namesInfoDetailed = ['title', 'description', 'og:description', 'og:title', 'twitter:description', 'twitter:title', 'twitter:image:alt'];
	let info = '';

	// get the additional information on specific information.
	if (namesInfoDetailed.includes(name)) {
		info = GetTextWordInformation(value, true);
	}

	// return a new information row with or without the row marker.
	if (markerName && markerValue) {
		return `<tr ${markerName}="${markerValue}"><td>${name} ${info}</td><td>${(isHtmlValue) ? value : EscapeHTML(ReplaceCharactersHTML(value))}</td></tr>`;
	} else {
		return `<tr><td>${name} ${info}</td><td>${(isHtmlValue) ? value : EscapeHTML(ReplaceCharactersHTML(value))}</td></tr>`;
	}
}

/**
 * Initialize the extension on load (register events, translate extension).
 */
jQuery(function() {
	$.fx.off = true;

	// translate all placeholder of the extension.
	TranslateHTML();

	// only register the events if the extension can be used.
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

	// get the current / active tab of the current window and send a message
	// to the content script to get the information from website.
	chrome.tabs.query({active: true, currentWindow: true}, tabs => {
		chrome.tabs.sendMessage(
			tabs[0].id,
			{info: INFO.META},
			LoadMetaDetails
		);
	});

	// the callback function executed by the content script to show meta information.
	const LoadMetaDetails = info => {
		$('html, body').animate({scrollTop: '0px'}, 0);

		// get the HTML container of the meta tab.
		const tabMetaDetails = $('div#view-meta-details');

		// get the table to show the meta information.
		const tableOthers = $('table#meta-details-others', tabMetaDetails);
		const tableOpenGraphBasic = $('table#meta-details-opengraph-basic', tabMetaDetails);
		const tableOpenGraphArticle = $('table#meta-details-opengraph-article', tabMetaDetails);
		const tableOpenGraphAudio = $('table#meta-details-opengraph-audio', tabMetaDetails);
		const tableOpenGraphBook = $('table#meta-details-opengraph-book', tabMetaDetails);
		const tableOpenGraphImage = $('table#meta-details-opengraph-image', tabMetaDetails);
		const tableOpenGraphProfile = $('table#meta-details-opengraph-profile', tabMetaDetails);
		const tableOpenGraphVideo = $('table#meta-details-opengraph-video', tabMetaDetails);
		const tableParsely = $('table#meta-details-parsely', tabMetaDetails);
		const tableTwitter = $('table#meta-details-twitter', tabMetaDetails);
		const tableDublinCore = $('table#meta-details-dublin-core', tabMetaDetails);
		const tableShareaholicContent = $('table#meta-details-shareaholic-content', tabMetaDetails);
		const tableShareaholicFeature = $('table#meta-details-shareaholic-feature', tabMetaDetails);

		// remove all rows of all meta tables.
		$('table[id^=meta-details-]').children('tbody').empty();

		// get all the meta information from the content script.
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
		const itemsDublinCore = (info.dublincore || []);
		const itemsShareaholicContent = (info.shareaholic.content || []);
		const itemsShareaholicFeature = (info.shareaholic.feature || []);

		// set Open Graph basic information to the table.
		itemsOpenGraphBasic.forEach(function(item, index) {
			tableOpenGraphBasic.children('tbody').append(GetInformationRow(item.name, (item.value || '').toString().trim(), 'id', `og-basic-${index}`));
		});

		// set Open Graph article information to the table.
		itemsOpenGraphArticle.forEach(function(item) {
			tableOpenGraphArticle.children('tbody').append(GetInformationRow(item.name, (item.value || '').toString().trim()));
		});

		// set Open Graph audio information to the table.
		itemsOpenGraphAudio.forEach(function(item) {
			tableOpenGraphAudio.children('tbody').append(GetInformationRow(item.name, (item.value || '').toString().trim()));
		});

		// set Open Graph book information to the table.
		itemsOpenGraphBook.forEach(function(item) {
			tableOpenGraphBook.children('tbody').append(GetInformationRow(item.name, (item.value || '').toString().trim()));
		});

		// set Open Graph image information to the table.
		itemsOpenGraphImage.forEach(function(item, index) {
			const value = (item.value || '').toString().trim();
			tableOpenGraphImage.children('tbody').append(GetInformationRow(item.name, value, 'id', `og-image-${index}`));

			// on image information, a image preview is possible.
			if (['og:image', 'og:image:url', 'og:image:secure_url'].includes(item.name.toLowerCase())) {
				ShowImagePreview(tableOpenGraphImage.find(`tbody tr#og-image-${index} td`), new URL(value, tabUrlOrigin));
			}
		});

		// set Open Graph profile information to the table.
		itemsOpenGraphProfile.forEach(function(item) {
			tableOpenGraphProfile.children('tbody').append(GetInformationRow(item.name, (item.value || '').toString().trim()));
		});

		// set Open Graph video information to the table.
		itemsOpenGraphVideo.forEach(function(item) {
			tableOpenGraphVideo.children('tbody').append(GetInformationRow(item.name, (item.value || '').toString().trim()));
		});

		// set Parsely information to the table.
		itemsParsely.forEach(function(item) {
			tableParsely.children('tbody').append(GetInformationRow(item.name, (item.value || '').toString().trim()));
		});

		// set Dublin Core information to the table.
		itemsDublinCore.forEach(function(item) {
			tableDublinCore.children('tbody').append(GetInformationRow(item.name, ((item.value || '').toString().trim())));
		});

		// set Twitter information to the table.
		itemsTwitter.forEach(function(item, index) {
			const value = (item.value || '').toString().trim();

			// some information can be displayed with additional information.
			tableTwitter.children('tbody').append(GetInformationRow(item.name, value, 'id', `twitter-${index}`));

			// on image information, a image preview is possible.
			if (['twitter:image:src', 'twitter:image'].includes(item.name.toLowerCase())) {
				ShowImagePreview(tableTwitter.find(`tbody tr#twitter-${index} td`), new URL(value, tabUrlOrigin));
			}
		});

		// set Shareaholic content information to the table.
		itemsShareaholicContent.forEach(function(item, index) {
			const value = (item.value || '').toString().trim();
			tableShareaholicContent.children('tbody').append(GetInformationRow(item.name, value, 'id', `shareaholic-${index}`));

			// on image information, a image preview is possible.
			if (['shareaholic:image'].includes(item.name.toLowerCase())) {
				ShowImagePreview(tableShareaholicContent.find(`tbody tr#shareaholic-${index} td`), new URL(value, tabUrlOrigin));
			}
		});

		// set Shareaholic content information to the table.
		itemsShareaholicFeature.forEach(function(item, index) {
			const value = (item.value || '').toString().trim();
			tableShareaholicFeature.children('tbody').append(GetInformationRow(item.name, value, 'id', `shareaholic-${index}`));

			// on image information, a image preview is possible.
			if (['shareaholic:image'].includes(item.name.toLowerCase())) {
				ShowImagePreview(tableShareaholicFeature.find(`tbody tr#shareaholic-${index} td`), new URL(value, tabUrlOrigin));
			}
		});

		// set other meta tags (not found above) to the table.
		itemsOthers.forEach(function(item, index) {
			const value = (item.value || '').toString().trim();

			// depending on the value of the meta property format the value.
			if (IsColor(value)) {
				tableOthers.children('tbody').append(GetInformationRow(item.name, GetFormattedColorValue(value), undefined, undefined, true));
			} else {
				tableOthers.children('tbody').append(GetInformationRow(item.name, value, 'id', `others-${index}`));
			}

			// on image information, a image preview is possible.
			if (['msapplication-tileimage', 'msapplication-square70x70logo', 'msapplication-square150x150logo', 'msapplication-square310x310logo', 'forem:logo', 'aiturec:image', 'vk:image', 'shareaholic:image'].includes(item.name.toLowerCase())) {
				ShowImagePreview(tableOthers.find(`tbody tr#others-${index} td`), new URL(value, tabUrlOrigin));
			}
		});

		// now all lists are created so it is possible to count the items of each list.
		SetTableCountOnCardHeader($('#meta-details-opengraph-basic-heading'), tableOpenGraphBasic);
		SetTableCountOnCardHeader($('#meta-details-opengraph-article-heading'), tableOpenGraphArticle);
		SetTableCountOnCardHeader($('#meta-details-opengraph-audio-heading'), tableOpenGraphAudio);
		SetTableCountOnCardHeader($('#meta-details-opengraph-book-heading'), tableOpenGraphBook);
		SetTableCountOnCardHeader($('#meta-details-opengraph-image-heading'), tableOpenGraphImage);
		SetTableCountOnCardHeader($('#meta-details-opengraph-profile-heading'), tableOpenGraphProfile);
		SetTableCountOnCardHeader($('#meta-details-opengraph-video-heading'), tableOpenGraphVideo);
		SetTableCountOnCardHeader($('#meta-details-twitter-heading'), tableTwitter);
		SetTableCountOnCardHeader($('#meta-details-dublincore-heading'), tableDublinCore);
		SetTableCountOnCardHeader($('#meta-details-parsely-heading'), tableParsely);
		SetTableCountOnCardHeader($('#meta-details-shareaholic-content-heading'), tableShareaholicContent);
		SetTableCountOnCardHeader($('#meta-details-shareaholic-feature-heading'), tableShareaholicFeature);
		SetTableCountOnCardHeader($('#meta-details-others-heading'), tableOthers);

		// display a hint if there are no meta elements (no accordions).
		SetEmptyHintOnTabAccordion($('div#view-meta-details'), chrome.i18n.getMessage('no_meta_items'));
	};
}

/**
 * View for Summary.
 */
function ViewSummary() {

	// get the current / active tab of the current window and send a message
	// to the content script to get the information from website.
	chrome.tabs.query({active: true, currentWindow: true}, tabs => {
		chrome.tabs.sendMessage(
			tabs[0].id,
			{info: INFO.SUMMARY},
			LoadSummary
		);
	});

	// the callback function executed by the content script to show summary information.
	const LoadSummary = info => {
		$('html, body').animate({scrollTop: '0px'}, 0);

		// get the HTML container of the summary tab.
		const tabSummary = $('div#view-summary');

		// get the table to show the summary information.
		const tableSummary = $('table#meta-head-info', tabSummary);

		// remove all rows of the summary table.
		tableSummary.children('tbody').empty();

		// get the meta information from the content script.
		const metas = (info.meta || []);
		const analytics = info.ga;
		const tagmanager = info.gtm;

		// get a specific order of the meta information.
		// the important information have to be visible on top of the list.
		const metaOrder = ['title', 'description', 'robots'];
		const metasDisplay = (metas.filter(meta => metaOrder.indexOf(meta.name) > -1).sort((a, b) => metaOrder.indexOf(a.name) - metaOrder.indexOf(b.name)) || []).concat((metas.filter(meta => metaOrder.indexOf(meta.name) === -1) || []));

		// iterate through all meta items to set on table with specific formatting and information if needed.
		metasDisplay.map(meta => meta.name).filter((v, i, a) => a.indexOf(v) === i).forEach(function(name) {
			const items = metasDisplay.filter(meta => meta.name === name);

			// check how many items are available. on multiple values display the values as list.
			if (items.length === 1) {
				if (name === 'canonical') {
					tableSummary.children('tbody').append(GetInformationRow(name + (items[0].value === tabUrl ? '<span class="info d-block">self-referential</span>' : ''), items[0].value));
				} else {
					if (IsColor(items[0].value)) {
						tableSummary.children('tbody').append(GetInformationRow(name, GetFormattedColorValue(items[0].value), undefined, undefined, true));
					} else {
						tableSummary.children('tbody').append(GetInformationRow(name, items[0].value));
					}
				}
			} else if (items.length > 1) {
				if (name === 'theme-color') {
					tableSummary.children('tbody').append(`<tr><td>${name}</td><td>${items.map(metaItem => GetFormattedColorValue(metaItem.value)).join('')}</td></tr>`);
				} else {
					tableSummary.children('tbody').append(`<tr><td>${name}</td><td><ul><li>${items.map(metaItem => EscapeHTML(metaItem.value)).join('</li><li>')}</li></ul></td></tr>`);
				}
			}
		});

		// function to group by a specific property.
		// this function will be used to group the identifiers of Google Analytics and Google Tag Manager.
		const GroupBy = key => array =>
			array.reduce((objectsByKeyValue, obj) => {
				objectsByKeyValue[obj[key]] = (objectsByKeyValue[obj[key]] || []).concat(obj.source).filter((v, i, a) => a.indexOf(v) === i);
				return objectsByKeyValue;
			}, {});

		// display the Google Analytics Tracking information of the website.
		if (analytics.identifiers.length > 0 || analytics.files.length > 0) {
			let info = [];
			let groups = GroupBy('id')(analytics.identifiers);
			info = info.concat(Object.keys(groups).map(identifier => `${identifier} (<i>${groups[identifier].join(' / ')}</i>)`));
			info = info.concat(analytics.files.map(item => item.original).filter((v, i, a) => a.indexOf(v) === i));
			tableSummary.children('tbody').append(`<tr><td>Google Analytics</td><td>${GetFormattedArrayValue(info.filter(item => item !== null))}</td></tr>`);
		}

		// display the Google Tag Manager information of the website.
		if (tagmanager.identifiers.length > 0 || tagmanager.files.length > 0) {
			let info = [];
			let groups = GroupBy('id')(tagmanager.identifiers);
			info = info.concat(Object.keys(groups).map(identifier => `${identifier} (<i>${groups[identifier].join(' / ')}</i>)`));
			info = info.concat(tagmanager.files.map(item => item.original).filter((v, i, a) => a.indexOf(v) === i));
			tableSummary.children('tbody').append(`<tr><td>Google Tag Manager</td><td>${GetFormattedArrayValue(info.filter(item => item !== null))}</td></tr>`);
		}

		// if there are no items display a hint.
		SetEmptyHint(tableSummary, chrome.i18n.getMessage('no_summary_items'));
	};
}

/**
 * View for Files.
 */
function ViewFiles() {

	// get the current / active tab of the current window and send a message
	// to the content script to get the information from website.
	chrome.tabs.query({active: true, currentWindow: true}, tabs => {
		chrome.tabs.sendMessage(
			tabs[0].id,
			{info: INFO.FILES},
			LoadFiles
		);
	});

	// the callback function executed by the content script to show files information.
	const LoadFiles = info => {
		$('html, body').animate({scrollTop: '0px'}, 0);

		// get the HTML container of the files tab.
		const tabFiles = $('div#view-files');

		// get the tables to show the files information.
		const tableFilesStylesheet = $('table#files-stylesheet', tabFiles);
		const tableFilesJavaScript = $('table#files-javascript', tabFiles);
		const tableFilesSpecial = $('table#files-special', tabFiles);
		const tableStylesheetDomains = $('table#list-files-stylesheet-domains', tabFiles);
		const tableJavaScriptDomains = $('table#list-files-javascript-domains', tabFiles);

		// get the files from the content script.
		const filesStylesheet = (info.stylesheet || []);
		const filesJavaScript = (info.javascript || []);
		const domainsStylesheet = GetDomains(filesStylesheet.map(file => file.url.href));
		const domainsJavaScript = GetDomains(filesJavaScript.map(file => file.url.href));

		// remove all rows of the files tables.
		tableFilesStylesheet.children('tbody').empty();
		tableFilesJavaScript.children('tbody').empty();
		tableFilesSpecial.children('tbody').empty();
		tableStylesheetDomains.children('tbody').empty();
		tableJavaScriptDomains.children('tbody').empty();

		// set all stylesheets to the table.
		filesStylesheet.forEach(function(file, index) {
			tableFilesStylesheet.children('tbody').append(`<tr id="stylesheet-${index}"><td><a href="${file.url.href}" target="_blank">${file.original}</a></td></tr>`);

			// check whether the media property exists and add the additional information.
			if (file.media.trim() !== '') {
				tableFilesStylesheet.find(`tbody > tr#stylesheet-${index} td`).append(GetInformation('media', file.media.trim()));
			}
		});

		// get all Google Analytics and Google Tag Manager files.
		const filesGoogleAnalytics = (info.googleanalytics || []);
		const filesGoogleTagManager = (info.googletagmanager || []);

		// set all JavaScript files to the table.
		filesJavaScript.forEach(function(file, index) {
			tableFilesJavaScript.children('tbody').append(`<tr id="javascript-${index}"><td><a href="${file.url.href}" target="_blank">${file.original}</a></td></tr>`);

			// check whether the async property exists and add the additional information.
			if (file.async === true) {
				tableFilesJavaScript.find(`tbody tr#javascript-${index} td`).append(GetInformation('async'));
			}

			// check whether the charset property exists and add the additional information.
			if (file.charset) {
				tableFilesJavaScript.find(`tbody tr#javascript-${index} td`).append(GetInformation('charset', file.charset.trim()));
			}

			// check whether the file is a Google Analytics file and add a additional information.
			if (filesGoogleAnalytics.findIndex(fileGA => fileGA.original === file.original) > -1) {
				tableFilesJavaScript.find(`tbody tr#javascript-${index} td`).append(GetInformation('Google Analytics', ''));
			}

			// check whether the file is a Google Tag Manager file and add a additional information.
			if (filesGoogleTagManager.findIndex(fileGTM => fileGTM.original === file.original) > -1) {
				tableFilesJavaScript.find(`tbody tr#javascript-${index} td`).append(GetInformation('Google Tag Manager', ''));
			}
		});

		// set all the stylesheet domains to the table.
		domainsStylesheet.filter((v, i, a) => a.indexOf(v) === i).filter(domain => domain.trim() !== '').sort().forEach(function(domain) {
			tableStylesheetDomains.children('tbody').append(GetInformationRow(domain, domainsStylesheet.filter(domainItem => domainItem === domain).length));
		});

		// set all the JavaScript domains to the table.
		domainsJavaScript.filter((v, i, a) => a.indexOf(v) === i).filter(domain => domain.trim() !== '').sort().forEach(function(domain) {
			tableJavaScriptDomains.children('tbody').append(GetInformationRow(domain, domainsJavaScript.filter(domainItem => domainItem === domain).length));
		});

		// create an array with all special files.
		let filesSpecial = [];
		filesSpecial.push(`${(new URL(tabUrl)).origin}/sitemap.xml`);
		filesSpecial.push(`${(new URL(tabUrl)).origin}/robots.txt`);

		// check for the special files and add to the table if available.
		filesSpecial.forEach(function(file, index) {
			fetch(file).then(function(response) {
				if (response.status == 200) {
					tableFilesSpecial.children('tbody').append(`<tr id="special-${index}"><td><a href="${file}" target="_blank">${file}</a></td></tr>`);
					SetTableCountOnCardHeader($('#special-heading'), tableFilesSpecial);

					// display a hint if there are no meta elements (no accordions).
					SetEmptyHintOnTabAccordion($('div#view-files'), chrome.i18n.getMessage('no_file_items'));
				}
			});
		});

		// set the count of rows / items to the card header.
		SetTableCountOnCardHeader($('#stylesheet-heading'), tableFilesStylesheet);
		SetTableCountOnCardHeader($('#javascript-heading'), tableFilesJavaScript);
		SetTableCountOnCardHeader($('#special-heading'), tableFilesSpecial);

		// display a hint if there are no meta elements (no accordions).
		SetEmptyHintOnTabAccordion($('div#view-files'), chrome.i18n.getMessage('no_file_items'));
	};
}

/**
 * View for Header.
 */
function ViewHeader() {
	$('html, body').animate({scrollTop: '0px'}, 0);

	// get the tab and table of the headers list.
	const tabHeaders = $('div#view-headers');
	const tableHeaders = $('table#info-headers', tabHeaders);

	// remove all available header information.
	tableHeaders.children('tbody').empty();

	// fetch the header information of the current url.
	fetch(tabUrl).then(function(response) {

		// set every information of the header to the table.
		for (let header of response.headers.entries()) {
			tableHeaders.children('tbody').append(GetInformationRow(header[0], header[1]));
		}

		// set the status of the response to the table.
		tableHeaders.children('tbody').append(GetInformationRow('HTTP Status', response.status));
		tableHeaders.children('tbody').append(GetInformationRow('HTTP Version', response.statusText.trim() === '' ? 'HTTP/2' : 'HTTP/1'));
	});
}

/**
 * View for Tools.
 */
function ViewTools() {
	$('html, body').animate({scrollTop: '0px'}, 0);

	// get the tab and table of the tools list.
	const tabTools = $('div#view-tools');
	const tableTools = $('table#info-tools', tabTools);

	// remove all available tools.
	tableTools.children('tbody').empty();

	// get the encoded url to set on a url as parameter.
	const encodedUrl = encodeURIComponent(tabUrl);

	// add the tool "Page Speed Insights" to the table.
	tableTools.children('tbody').append(GetToolsItem(
		chrome.i18n.getMessage('tools_pagespeed_insights_title'),
		chrome.i18n.getMessage('tools_pagespeed_insights_description'),
		`https://developers.google.com/speed/pagespeed/insights/?url=${encodedUrl}`
	));

	// add the tool "W3C CSS Validation" to the table.
	tableTools.children('tbody').append(GetToolsItem(
		chrome.i18n.getMessage('tools_w3c_css_validation_title'),
		chrome.i18n.getMessage('tools_w3c_css_validation_description'),
		`https://jigsaw.w3.org/css-validator/validator?uri=${encodedUrl}`
	));

	// add the tool "Nu HTML checker" to the table.
	tableTools.children('tbody').append(GetToolsItem(
		chrome.i18n.getMessage('tools_nu_html_checker_title'),
		chrome.i18n.getMessage('tools_nu_html_checker_description'),
		`https://validator.w3.org/nu/?doc=${encodedUrl}`
	));

	// add the tool "GTmetrix" to the table.
	tableTools.children('tbody').append(GetToolsItem(
		chrome.i18n.getMessage('tools_gtmetrix_title'),
		chrome.i18n.getMessage('tools_gtmetrix_description'),
		`https://gtmetrix.com/?url=${encodedUrl}`
	));

	// add the tool "Google Search Console Rich Result Test" to the table.
	tableTools.children('tbody').append(GetToolsItem(
		chrome.i18n.getMessage('tools_gsc_rich_results_title'),
		chrome.i18n.getMessage('tools_gsc_rich_results_description'),
		`https://search.google.com/test/rich-results?url=${encodedUrl}`
	));

	// add the tool "Google Search Console Mobile Friendly Test" to the table.
	tableTools.children('tbody').append(GetToolsItem(
		chrome.i18n.getMessage('tools_gsc_mobile_friendly_title'),
		chrome.i18n.getMessage('tools_gsc_mobile_friendly_description'),
		`https://search.google.com/test/mobile-friendly?url=${encodedUrl}`
	));

	// set the font color of the about links to red if the chrome extension is in development environment.
	if (chrome.runtime.id !== storeId) {
		$('div.about a').css('color', '#f00');
	}
}

/**
 * View for Headings.
 */
function ViewHeadings() {

	// get the current / active tab of the current window and send a message
	// to the content script to get the information of the website.
	chrome.tabs.query({active: true, currentWindow: true}, tabs => {
		chrome.tabs.sendMessage(
			tabs[0].id,
			{info: INFO.HEADINGS},
			LoadHeadings
		);
	});

	// the callback function executed by the content script to show heading information.
	const LoadHeadings = info => {
		$('html, body').animate({scrollTop: '0px'}, 0);

		// get the HTML container of the headings tab.
		const tabHeadings = $('div#view-headings');

		// get the tables to show the headings information.
		const tableHeadings = $('table#list-headings', tabHeadings);
		const tableHeadingsStatistics = $('table#heading-stats', tabHeadings);
		const tableHeadingsErrors = $('table#list-headings-errors', tabHeadings);

		// get the headings from the content script.
		const headings = (info.headings || []);

		// remove all rows of the headings table.
		tableHeadings.children('tbody').empty();
		tableHeadingsErrors.children('tbody').empty();

		// reset the filter on the heading tab.
		ResetHeadingFilter();

		// iterate through the different levels of the headings and set the stats.
		for (level = 1; level <= 6; level++) {
			tableHeadingsStatistics.find(`td[id="headings-h${level}"]`).text(headings.filter(heading => heading.type === `h${level}`).length);
			$(`td[id="headings-h${level}"]`).on('click', {'level': level}, CallbackHeadingFilter);
		}

		// set the total count of headings to the table.
		tableHeadingsStatistics.find('td[id="headings-all"]').text(headings.length);

		// add all found headings to the table.
		headings.forEach(function(heading) {
			tableHeadings.children('tbody').append(`<tr class="level-${heading.type} is-empty"><td><span>${heading.type}</span>${EscapeHTML(heading.text)}${GetTextWordInformation(heading.text, true)}</td></tr>`);
		});

		// set a hint if there are no headings on the website.
		SetEmptyHint(tableHeadings, chrome.i18n.getMessage('no_heading_items'));

		// set the count of found errors and warnings.
		SetTableCountOnCardHeader($('#headings-errors-heading'), tableHeadingsErrors);
	};
}

/**
 * View for Images.
 */
function ViewImages() {

	// get the current / active tab of the current window and send a message
	// to the content script to get the information of the website.
	chrome.tabs.query({active: true, currentWindow: true}, tabs => {
		chrome.tabs.sendMessage(
			tabs[0].id,
			{info: INFO.IMAGES},
			LoadImages
		);
	});

	// the callback function executed by the content script to show image information.
	const LoadImages = info => {
		$('html, body').animate({scrollTop: '0px'}, 0);

		// get the HTML container of the images tab.
		const tabImages = $('div#view-images');

		// get the tables to show the images information.
		const tableImages = $('table#list-images', tabImages);
		const tableImagesStatistics = $('table#image-stats', tabImages);
		const tableImagesDomains = $('table#list-image-domains', tabImages);
		const tableImagesIcons = $('table#list-image-icons', tabImages);

		// get the images and icons from the content script.
		const images = (info.images || []);
		const icons = (info.icons || []);
		const domains = GetDomains(images.map(image => image.source));

		// remove all rows of the images, icons and domains table.
		tableImages.children('tbody').empty();
		tableImagesIcons.children('tbody').empty();
		tableImagesDomains.children('tbody').empty();

		// set all the images to the table.
		images.filter(image => (image.source || '').toString().trim() !== '').forEach(function(image, index) {
			tableImages.children('tbody').append(`<tr id="img-${index}"><td><a target="_blank" href="${image.source}">${image.src}</a></td></tr>`);
			ShowImagePreview($(`tbody tr#img-${index} td`, tableImages), image.source);

			// set the attribute information to the row.
			for (let attribute of ['alt', 'title']) {
				if ((image[attribute] || '').toString().trim() !== '') {
					tableImages.find(`tbody tr#img-${index} td`).append(GetInformation(attribute, (image[attribute] || '').toString().trim()));
				}
			}

			// set the image information of the image itself.
			SetImageInfo(tableImages.find(`tbody tr#img-${index} td`), image.source);
		});

		// set all the domains to the table.
		domains.filter((v, i, a) => a.indexOf(v) === i).sort().forEach(function(domain) {
			tableImagesDomains.children('tbody').append(GetInformationRow(domain, domains.filter(domainItem => domainItem === domain).length));
		});

		// set all the icons to the table.
		icons.filter(icon => (icon.href || '').toString().trim() !== '').forEach(function(icon, index) {
			tableImagesIcons.children('tbody').append(`<tr id="icon-${index}"><td><a target="_blank" href="${icon.source}">${icon.href}</a></td></tr>`);
			ShowImagePreview($(`tr#icon-${index} td`, tableImagesIcons), icon.source);

			// set the attribute information to the row.
			for (let attribute of ['type', 'sizes']) {
				if ((icon[attribute] || '').toString().trim() !== '') {
					tableImagesIcons.find(`tbody tr#icon-${index} td`).append(GetInformation(attribute, (icon[attribute] || '').toString().trim()));
				}
			}

			// set the image information of the icon itself.
			SetImageInfo(tableImagesIcons.find(`tbody tr#icon-${index} td`), icon.source);
		});

		// set hints on empty tables.
		SetEmptyHint(tableImages, chrome.i18n.getMessage('no_items', chrome.i18n.getMessage('images_lc')));
		SetEmptyHint(tableImagesDomains, chrome.i18n.getMessage('no_domain_items', chrome.i18n.getMessage('images_lc')));
		SetEmptyHint(tableImagesIcons, chrome.i18n.getMessage('no_items', chrome.i18n.getMessage('icons_lc')));

		// set the image statistics to the table.
		tableImagesStatistics.find('td[id="image-stats-all"]').text(images.length);

		// get the count of the attributes to check.
		const cntWithoutAlt = images.filter(image => image.alt === '').length;
		const cntWithoutSrc = images.filter(image => image.src === '').length;
		const cntWithoutTitle = images.filter(image => image.title === '').length;

		// get the fields of the attributes to check.
		const fieldWithoutAlt = tableImagesStatistics.find('td[id="image-stats-without-alt"]');
		const fieldWithoutSrc = tableImagesStatistics.find('td[id="image-stats-without-src"]');
		const fieldWithoutTitle = tableImagesStatistics.find('td[id="image-stats-without-title"]');

		// set the count of the attributes to the fields and format the value based on the count.
		fieldWithoutAlt.text(cntWithoutAlt).removeClass('text-danger fw-bold').addClass(cntWithoutAlt > 0 ? 'text-danger fw-bold' : '');
		fieldWithoutSrc.text(cntWithoutSrc).removeClass('text-danger fw-bold').addClass(cntWithoutSrc > 0 ? 'text-danger fw-bold' : '');
		fieldWithoutTitle.text(cntWithoutTitle).removeClass('text-danger fw-bold').addClass(cntWithoutTitle > 0 ? 'text-danger fw-bold' : '');
	};
}

/**
 * View for Hyperlinks.
 */
function ViewHyperlinks() {

	// get the current / active tab of the current window and send a message
	// to the content script to get the information of the website.
	chrome.tabs.query({active: true, currentWindow: true}, tabs => {
		chrome.tabs.sendMessage(
			tabs[0].id,
			{info: INFO.LINKS},
			LoadHyperlinks
		);
	});

	// the callback function executed by the content script to show hyperlink information.
	const LoadHyperlinks = info => {
		$('html, body').animate({scrollTop: '0px'}, 0);

		// get the HTML container of the hyperlinks tab.
		const tabHyperlinks = $('div#view-hyperlinks');

		// get the table objects to organize the content.
		const tableHyperlinks = $('table#list-hyperlink', tabHyperlinks);
		const tableAlternate = $('table#list-alternate', tabHyperlinks);
		const tableHyperlinksStatistics = $('table#hyperlink-stats', tabHyperlinks);
		const tableProtocolsStatistics = $('table#hyperlink-protocol-stats', tabHyperlinks);
		const tableAttributesStatistics = $('table#hyperlink-attribute-stats', tabHyperlinks);
		const tableDomains = $('table#list-hyperlink-domain', tabHyperlinks);
		const tablePreload = $('table#list-preload', tabHyperlinks);
		const tableDnsPrefetch = $('table#list-dns-prefetch', tabHyperlinks);
		const tablePreconnect = $('table#list-preconnect', tabHyperlinks);

		// remove all rows of the tables.
		tableHyperlinks.children('tbody').empty();
		tableAlternate.children('tbody').empty();
		tableDomains.children('tbody').empty();
		tablePreload.children('tbody').empty();
		tableDnsPrefetch.children('tbody').empty();
		tablePreconnect.children('tbody').empty();

		// get the information from the content script.
		const hyperlinks = (info.links || []);
		const alternates = (info.alternate || []);
		const preloads = (info.preload || []);
		const prefetches = (info.dnsprefetch || []);
		const preconnects = (info.preconnect || []);
		const domains = GetDomains(hyperlinks.filter(link => link.url !== undefined).map(link => link.url.href));

		// set all the hyperlinks with href value to the table.
		// don't show the hyperlinks with empty href attribute.
		hyperlinks.filter(hyperlink => hyperlink.href !== '').forEach(function(hyperlink, index) {
			tableHyperlinks.children('tbody').append(`<tr id="link-${index}"><td><a target="_blank" href="${(hyperlink.url !== undefined) ? hyperlink.url.href : ''}">${hyperlink.href}</a></td></tr>`);

			// set the attribute information to the row.
			for (let attribute of ['rel', 'target', 'title']) {
				if ((hyperlink[attribute] || '').toString().trim() !== '') {
					tableHyperlinks.find(`tbody tr#link-${index} td`).append(GetInformation(attribute, (hyperlink[attribute] || '').toString().trim()));
				}
			}
		});

		// set all the hyperlink domains to the table.
		domains.filter((v, i, a) => a.indexOf(v) === i).sort().forEach(function(domain) {
			tableDomains.children('tbody').append(GetInformationRow(domain, domains.filter(domainItem => domainItem === domain).length));
		});

		// set all the preloads to the table.
		preloads.forEach(function(preload) {
			tablePreload.children('tbody').append(`<tr><td>${preload.href}</td></tr>`);
		});

		// set all the DNS prefetches to the table.
		prefetches.forEach(function(prefetch) {
			tableDnsPrefetch.children('tbody').append(`<tr><td>${prefetch.href}</td></tr>`);
		});

		// set all the preconnects to the table.
		preconnects.forEach(function(preconnect) {
			tablePreconnect.children('tbody').append(`<tr><td>${preconnect.href}</td></tr>`);
		});

		// set all the alternates to the table.
		alternates.forEach(function(alternate, index) {
			tableAlternate.children('tbody').append(`<tr id="alternate-${index}"><td><a href="${alternate.href}" target="_blank">${alternate.href}</a></td></tr>`);

			// set the attribute information to the row.
			for (let attribute of ['title', 'hreflang']) {
				if ((alternates[attribute] || '').toString().trim() !== '') {
					tableAlternate.find(`tbody tr#alternate-${index} td`).append(GetInformation(attribute, (alternates[attribute] || '').toString().trim()));
				}
			}
		});

		// set hints on empty tables.
		SetEmptyHint(tableHyperlinks, chrome.i18n.getMessage('no_items', chrome.i18n.getMessage('links_lc')));
		SetEmptyHint(tableAlternate, chrome.i18n.getMessage('no_alternate_items'));
		SetEmptyHint(tableDomains, chrome.i18n.getMessage('no_domain_items', chrome.i18n.getMessage('links_lc')));
		SetEmptyHint(tablePreconnect, chrome.i18n.getMessage('no_preconnect_items'));
		SetEmptyHint(tableDnsPrefetch, chrome.i18n.getMessage('no_dns_prefetch_items'));
		SetEmptyHint(tablePreload, chrome.i18n.getMessage('no_preload_items'));

		// set the statistics for the hyperlinks.
		tableHyperlinksStatistics.find('td[id="hyperlink-stats-all"]').text(hyperlinks.length);
		tableHyperlinksStatistics.find('td[id="hyperlink-stats-all-unique"]').text(hyperlinks.filter(link => link.url !== undefined).map(link => link.url.href).filter((v, i, a) => a.indexOf(v) === i).length);
		tableHyperlinksStatistics.find('td[id="hyperlink-stats-internal"]').text(hyperlinks.filter(link => link.url !== undefined && link.url.href.startsWith(tabUrlOrigin) === true).length);
		tableHyperlinksStatistics.find('td[id="hyperlink-stats-internal-unique"]').text(hyperlinks.filter(link => link.url !== undefined && link.url.href.startsWith(tabUrlOrigin) === true).map(link => link.url.href).filter((v, i, a) => a.indexOf(v) === i).length);
		tableHyperlinksStatistics.find('td[id="hyperlink-stats-external"]').text(hyperlinks.filter(link => link.url !== undefined && link.url.href.startsWith(tabUrlOrigin) === false).length);
		tableHyperlinksStatistics.find('td[id="hyperlink-stats-external-unique"]').text(hyperlinks.filter(link => link.url !== undefined && link.url.href.startsWith(tabUrlOrigin) === false).map(link => link.url.href).filter((v, i, a) => a.indexOf(v) === i).length);

		// set the statistics for the attributes.
		// get the count of the attributes to check.
		const cntWithoutTitle = hyperlinks.filter(link => link.title === '').length;
		const cntWithoutHref = hyperlinks.filter(link => link.href === '').length;
		const cntProtocolHttp = hyperlinks.filter(link => link.url !== undefined && link.url.protocol === 'http').length;

		// get the fields of the attributes to check.
		const fieldHyperlinkTitle = tableAttributesStatistics.find('td[id="hyperlink-attribute-stats-without-title"]');
		const fieldHyperlinkHref = tableAttributesStatistics.find('td[id="hyperlink-attribute-stats-without-href"]');
		const fieldHyperlinkProtocolHttp = tableProtocolsStatistics.find('td[id="hyperlink-protocol-stats-http"]');

		// set the count to the fields and format the count based on the value.
		fieldHyperlinkTitle.text(cntWithoutTitle).removeClass('text-danger fw-bold').addClass(cntWithoutTitle > 0 ? 'text-danger fw-bold' : '');
		fieldHyperlinkHref.text(cntWithoutHref).removeClass('text-danger fw-bold').addClass(cntWithoutHref > 0 ? 'text-danger fw-bold' : '');
		fieldHyperlinkProtocolHttp.text(cntProtocolHttp).removeClass('text-warning fw-bold').addClass(cntProtocolHttp > 0 ? 'text-warning fw-bold' : '');

		// set the statistics for the protocols of the hyperlinks.
		// HTTP protocol statistics are covered above because a number will be shown as warning.
		tableProtocolsStatistics.find('td[id="hyperlink-protocol-stats-https"]').text(hyperlinks.filter(link => link.url !== undefined && link.url.protocol === 'https').length);
		tableProtocolsStatistics.find('td[id="hyperlink-protocol-stats-mailto"]').text(hyperlinks.filter(link => link.url !== undefined && link.url.protocol === 'mailto').length);
		tableProtocolsStatistics.find('td[id="hyperlink-protocol-stats-javascript"]').text(hyperlinks.filter(link => link.url !== undefined && link.url.protocol === 'javascript').length);
		tableProtocolsStatistics.find('td[id="hyperlink-protocol-stats-whatsapp"]').text(hyperlinks.filter(link => link.url !== undefined && link.url.protocol === 'whatsapp').length);
		tableProtocolsStatistics.find('td[id="hyperlink-protocol-stats-tel"]').text(hyperlinks.filter(link => link.url !== undefined && link.url.protocol === 'tel').length);
		tableProtocolsStatistics.find('td[id="hyperlink-protocol-stats-others"]').text(hyperlinks.filter(link => link.url !== undefined && ['http', 'https', 'mailto', 'javascript', 'whatsapp', 'tel'].includes(link.url.protocol) === false && link.href !== '').length);
	};
}
