/**
 * SEO Insights
 * Copyright (C) 2021 Sebastian Brosch
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

// common information about the website.
let tabUrl = '';
let tabUrlOrigin = '';
const storeId = 'nlkopdpfkbifcibdoecnfabipofhnoom';

// start the chrome extension and inject the scripts to the website.
// the injected scripts are used to get the needed information of the website.
(function() {
	chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
		const tab = tabs[0];

		// set the common information of the website.
		tabUrl = decodeURI(tab.url);
		tabUrlOrigin = decodeURI((new URL(tab.url)).origin);
		tabUrlDomain = decodeURI((new URL(tab.url)).hostname);

		// check whether it is possible to inject a content script to the current tab.
		// there are some protocols and sites where no content script can be injected.
		if (!canInjectContentScript(tab)) {
			$('body').addClass('not-supported');
			return false;
		} else {
			$('body').removeClass('not-supported');
		}

		// programmatically inject the content scripts to the current tab.
		chrome.scripting.executeScript({files: [
			'libs/jquery-3.6.4.min.js',
			'scripts/helper.js',
			'scripts/meta.js',
			'scripts/head.js',
			'scripts/image.js',
			'scripts/heading.js',
			'scripts/link.js',
			'scripts/files.js',
			'content.js',
		], target: {tabId: tab.id}}, () => {
			viewSummary();
		});
	});
})();

/**
 * Returns the state whether a content script can be injected into a tab.
 * @param {chrome.tabs.Tab} tab The tab which should be checked whether a content script can be injected.
 * @returns {boolean} The state whether a content script can be injected.
 */
function canInjectContentScript(tab) {

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
function setTableCountOnCardHeader(cardHeader, table) {
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
function resetHeadingFilter() {
	$('tr.filter td[id^="headings-h"]').each(function() {
		$(this).off('click');
		$(this).css('color', '#000');
	});
}

/**
 * Callback function of the heading filter items.
 * @param {object} event The event object.
 */
function callbackHeadingFilter(event) {

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
function showImagePreview(hoverItem, imgUrl) {
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
function getDomains(urls) {
	const domains = [];

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
function setEmptyHint(table, hint) {
	if (table.children('tbody').children().length === 0) {
		table.children('tbody').append(`<tr class="empty-alert"><td><div class="alert alert-primary rounded-0" role="alert">${hint}</div></td></tr>`);
	}
}

/**
 * Sets a hint to a empty tab as placeholder / additional information.
 * @param {object} tab The HTML object of the tab.
 * @param {string} hint The hint to be shown on the empty tab.
 */
function setEmptyHintOnTabAccordion(tab, hint) {
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
function setImageInfo(html, source) {
	const image = new Image;
	image.onload = function() {
		html.append(getInformation('size', `${image.width} x ${image.height}`));
	};
	image.src = source;
}

/**
 * Returns the HTML element with the additional information.
 * @param {string} label The label value (displayed in bold letters) used on the additional information.
 * @param {string} value The value used on the additional information.
 * @returns {string} The HTML element with the additional information.
 */
function getInformation(label, value) {

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
function isColorHEX(value) {
	return (value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i) !== null);
}

/**
 * Returns the state whether the given value is a RGB / RGBA color.
 * @param {string} value The value to check for a RGB / RGBA color.
 * @returns {boolean} State whether the given value is a RGB / RGBA color.
 */
function isColorRGB(value) {
	return (value.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?(,[\s+]?\d?\.?\d+)?[\s+]?\)$/i) !== null);
}

/**
 * Returns the state whether the given value is a color keyword.
 * @param {string} value The value to check for a color keyword.
 * @returns {boolean} State whether the given value is a color keyword.
 */
function isColorKeyword(value) {
	return Object.keys(getColorKeywords()).includes(value.toLowerCase());
}

/**
 * Returns the state whether the given value is a color value.
 * @param {string} value The value to check for a color value.
 * @returns {boolean} State whether the given value is a color value.
 */
function isColor(value) {
	return (isColorHEX(value) || isColorRGB(value) || isColorKeyword(value));
}

/**
 * Returns a tool item to display on the list of the tool view.
 * @param {string} title The title of the tool.
 * @param {string} description The description of the tool.
 * @param {string} link The link to the tool website with website specific parameter.
 */
function getToolsItem(title, description, link) {
	return `<tr><td><a class="full-link" href="${link}" target="_blank"><div class="heading">${title}</div><span class="info">${description}</span></a></td></tr>`;
}

/**
 * Returns a string value with leadings zeros and the expected length.
 * @param {string} str The string value padded with zeros.
 * @param {integer} length The resulting string length after padding.
 * @returns {string} The string value padded with zeros to the expected length.
 */
function padZero(str, length) {
	length = length || 2;
	const zeros = new Array(length).join('0');
	return (zeros + str).slice(-length);
}

/**
 * Returns the given as value or list depending of the count of values.
 * @param {Array<string>} values The values to be formatted.
 * @returns {string} A single value or a list of values to display on the extension.
 */
function getFormattedArrayValue(values) {
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
function invertColor(hexValue, useBlackWhite) {

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
	let red = parseInt(hexValue.slice(0, 2), 16);
	let green = parseInt(hexValue.slice(2, 4), 16);
	let blue = parseInt(hexValue.slice(4, 6), 16);

	// it is possible to invert to black or white.
	// https://stackoverflow.com/a/3943023/3840840
	if (useBlackWhite) {
		return (red * 0.299 + green * 0.587 + blue * 0.114) > 186 ? '#000000' : '#FFFFFF';
	}

	// invert the red, green and blue value.
	red = (255 - red).toString(16);
	green = (255 - green).toString(16);
	blue = (255 - blue).toString(16);

	// pad each color component with zeros and return the hex value.
	return `#${padZero(red)}${padZero(green)}${padZero(blue)}`;
}

/**
 * Returns the HEX value of the given RGB or RGBA value.
 * @param {string} rgb The RGB / RGBA value to convert.
 * @returns {string} The HEX value of the given RGB / RGBA value.
 */
function convertRGBtoHEX(rgb) {
	rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
	return (rgb && rgb.length === 4) ? `#${`0${parseInt(rgb[1], 10).toString(16)}`.slice(-2)}${`0${parseInt(rgb[2], 10).toString(16)}`.slice(-2)}${`0${parseInt(rgb[3], 10).toString(16)}`.slice(-2)}` : '';
}

/**
 * Returns the count of words in a given string value.
 * @param {string} text The string value to get the count of words from.
 * @returns {integer} The count of words in the given string value.
 * @see https://stackoverflow.com/a/18679657/3840840
 */
function getWordCount(text) {
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
function getEmojiCount(text) {
	return (text.match(/\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation}|\p{So}|\p{Emoji}\uFE0F/gu) || []).length;
}

/**
 * Returns the information of the text of a given string value.
 * @param {string} text The string value to get the text information from.
 * @returns {object} The object with information of the given string info.
 */
function getTextInformation(text) {
	return {
		'chars': replaceCharactersHTML(text).length,
		'words': getWordCount(replaceCharactersHTML(text)),
		'emojis': getEmojiCount(text),
	};
}

/**
 * Returns a string with all HTML characters replaced to the real characters.
 * @param {string} str The string value to replace all HTML characters to real characters.
 * @returns {string} The string with all replaced HTML characters.
 */
function replaceCharactersHTML(str) {
	return String(str).replace(/&#*([^&#;]+);/g, function(match, code) {
		if (isNaN(code)) {
			return {
				"amp": "&",
				"lt": "<",
				"gt": ">",
				"quot": '"',
				"x2F": "/",
			}[code];
		} else {
			return String.fromCharCode(code);
		}
	});
}

/**
 * Returns a escaped string of the given string to also display HTML specific chars on HTML.
 * @param {string} str The string value to be escaped.
 * @returns {string} The escaped string value to display HTML specific chars on HTML.
 */
function escapeHTML(str) {
	return String(str).replace(/[&<>"'/]/g, function(char) {
		return {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': '&quot;',
			"'": '&#39;',
			"/": '&#x2F;',
		}[char];
	});
}

/**
 * Returns all available color keywords and their hex value.
 * @returns {object} An object with all color keywords and their hex value.
 * @see https://drafts.csswg.org/css-color-3/#svg-color
 */
function getColorKeywords() {
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
		'yellowgreen': '9acd32',
	};
}

/**
 * Returns a color value as HTML element.
 * @param {string} value The color value to format.
 * @returns {string} The formatted color value as HTML element.
 */
function getFormattedColorValue(value) {
	const textColor = (isColorKeyword(value)) ? getColorKeywords()[value.toLowerCase()] : ((value.toLowerCase().startsWith('rgb')) ? convertRGBtoHEX(value) : value);
	return `<div class="theme-color" style="background: ${value}; color: ${invertColor(textColor, true)}">${value}</div>`;
}

/**
 * Returns the formatted text information of a given text.
 * @param {string} text The text to get the formatted text information from.
 * @param {boolean} newline State whether the tags should be displayed on a new line.
 * @returns {string} The formatted text information of the given text.
 */
function getTextWordInformation(text, newline = false) {
	text = (text || '').toString().trim();

	// don't get the text information of a empty string value.
	if (text.length === 0) {
		return '';
	}

	// get the text information of the given text.
	const info = getTextInformation(text);

	// return the formatted text information.
	// display the count of emojis only if there are emojis.
	return ((newline === true) ? '<br>' : '')
		+ getInformation('', `${info.chars} ${chrome.i18n.getMessage('chars')}`)
		+ getInformation('', `${info.words} ${chrome.i18n.getMessage('words')}`)
		+ ((info.emojis > 0) ? getInformation('', `${info.emojis} ${chrome.i18n.getMessage('emojis')}`) : '');
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
function getInformationRow(name, value, markerName, markerValue, isHtmlValue = false) {
	const namesInfoDetailed = ['title', 'description', 'og:description', 'og:title', 'twitter:description', 'twitter:title', 'twitter:image:alt'];
	let info = '';

	// get the additional information on specific information.
	if (namesInfoDetailed.includes(name)) {
		info = getTextWordInformation(value, true);
	}

	// return a new information row with or without the row marker.
	if (markerName && markerValue) {
		return `<tr ${markerName}="${markerValue}"><td>${name} ${info}</td><td>${(isHtmlValue) ? value : escapeHTML(replaceCharactersHTML(value))}</td></tr>`;
	} else {
		return `<tr><td>${name} ${info}</td><td>${(isHtmlValue) ? value : escapeHTML(replaceCharactersHTML(value))}</td></tr>`;
	}
}

/**
 * Initialize the extension on load (register events, translate extension).
 */
jQuery(function() {
	$.fx.off = true;

	// translate all placeholder of the extension.
	translateTextContent();

	// only register the events if the extension can be used.
	if ($('body').hasClass('not-supported') === false) {
		$('button#view-summary-tab').on('click', viewSummary);
		$('button#view-meta-details-tab').on('click', viewMetaDetails);
		$('button#view-headings-tab').on('click', viewHeadings);
		$('button#view-images-tab').on('click', viewImages);
		$('button#view-hyperlinks-tab').on('click', viewHyperlinks);
		$('button#view-files-tab').on('click', viewFiles);
		$('button#view-headers-tab').on('click', viewHeader);
		$('button#view-tools-tab').on('click', viewTools);
	}
});

/**
 * View for Meta.
 */
function viewMetaDetails() {

	// get the current / active tab of the current window and send a message
	// to the content script to get the information from website.
	chrome.tabs.query({active: true, currentWindow: true}, tabs => {
		chrome.tabs.sendMessage(
			tabs[0].id,
			{info: INFO.META},
			LoadMetaDetails,
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
			tableOpenGraphBasic.children('tbody').append(getInformationRow(item.name, (item.value || '').toString().trim(), 'id', `og-basic-${index}`));
		});

		// set Open Graph article information to the table.
		itemsOpenGraphArticle.forEach(function(item) {
			tableOpenGraphArticle.children('tbody').append(getInformationRow(item.name, (item.value || '').toString().trim()));
		});

		// set Open Graph audio information to the table.
		itemsOpenGraphAudio.forEach(function(item) {
			tableOpenGraphAudio.children('tbody').append(getInformationRow(item.name, (item.value || '').toString().trim()));
		});

		// set Open Graph book information to the table.
		itemsOpenGraphBook.forEach(function(item) {
			tableOpenGraphBook.children('tbody').append(getInformationRow(item.name, (item.value || '').toString().trim()));
		});

		// set Open Graph image information to the table.
		itemsOpenGraphImage.forEach(function(item, index) {
			const value = (item.value || '').toString().trim();
			tableOpenGraphImage.children('tbody').append(getInformationRow(item.name, value, 'id', `og-image-${index}`));

			// on image information, a image preview is possible.
			if (['og:image', 'og:image:url', 'og:image:secure_url'].includes(item.name.toLowerCase())) {
				showImagePreview(tableOpenGraphImage.find(`tbody tr#og-image-${index} td`), new URL(value, tabUrlOrigin));
			}
		});

		// set Open Graph profile information to the table.
		itemsOpenGraphProfile.forEach(function(item) {
			tableOpenGraphProfile.children('tbody').append(getInformationRow(item.name, (item.value || '').toString().trim()));
		});

		// set Open Graph video information to the table.
		itemsOpenGraphVideo.forEach(function(item) {
			tableOpenGraphVideo.children('tbody').append(getInformationRow(item.name, (item.value || '').toString().trim()));
		});

		// set Parsely information to the table.
		itemsParsely.forEach(function(item) {
			tableParsely.children('tbody').append(getInformationRow(item.name, (item.value || '').toString().trim()));
		});

		// set Dublin Core information to the table.
		itemsDublinCore.forEach(function(item) {
			tableDublinCore.children('tbody').append(getInformationRow(item.name, ((item.value || '').toString().trim())));
		});

		// set Twitter information to the table.
		itemsTwitter.forEach(function(item, index) {
			const value = (item.value || '').toString().trim();

			// some information can be displayed with additional information.
			tableTwitter.children('tbody').append(getInformationRow(item.name, value, 'id', `twitter-${index}`));

			// on image information, a image preview is possible.
			if (['twitter:image:src', 'twitter:image'].includes(item.name.toLowerCase())) {
				showImagePreview(tableTwitter.find(`tbody tr#twitter-${index} td`), new URL(value, tabUrlOrigin));
			}
		});

		// set Shareaholic content information to the table.
		itemsShareaholicContent.forEach(function(item, index) {
			const value = (item.value || '').toString().trim();
			tableShareaholicContent.children('tbody').append(getInformationRow(item.name, value, 'id', `shareaholic-${index}`));

			// on image information, a image preview is possible.
			if (['shareaholic:image'].includes(item.name.toLowerCase())) {
				showImagePreview(tableShareaholicContent.find(`tbody tr#shareaholic-${index} td`), new URL(value, tabUrlOrigin));
			}
		});

		// set Shareaholic content information to the table.
		itemsShareaholicFeature.forEach(function(item, index) {
			const value = (item.value || '').toString().trim();
			tableShareaholicFeature.children('tbody').append(getInformationRow(item.name, value, 'id', `shareaholic-${index}`));

			// on image information, a image preview is possible.
			if (['shareaholic:image'].includes(item.name.toLowerCase())) {
				showImagePreview(tableShareaholicFeature.find(`tbody tr#shareaholic-${index} td`), new URL(value, tabUrlOrigin));
			}
		});

		// set other meta tags (not found above) to the table.
		itemsOthers.forEach(function(item, index) {
			const value = (item.value || '').toString().trim();

			// depending on the value of the meta property format the value.
			if (isColor(value)) {
				tableOthers.children('tbody').append(getInformationRow(item.name, getFormattedColorValue(value), undefined, undefined, true));
			} else {
				tableOthers.children('tbody').append(getInformationRow(item.name, value, 'id', `others-${index}`));
			}

			// on image information, a image preview is possible.
			if (['msapplication-tileimage', 'msapplication-square70x70logo', 'msapplication-square150x150logo', 'msapplication-square310x310logo', 'forem:logo', 'aiturec:image', 'vk:image', 'shareaholic:image'].includes(item.name.toLowerCase())) {
				showImagePreview(tableOthers.find(`tbody tr#others-${index} td`), new URL(value, tabUrlOrigin));
			}
		});

		// now all lists are created so it is possible to count the items of each list.
		setTableCountOnCardHeader($('#meta-details-opengraph-basic-heading'), tableOpenGraphBasic);
		setTableCountOnCardHeader($('#meta-details-opengraph-article-heading'), tableOpenGraphArticle);
		setTableCountOnCardHeader($('#meta-details-opengraph-audio-heading'), tableOpenGraphAudio);
		setTableCountOnCardHeader($('#meta-details-opengraph-book-heading'), tableOpenGraphBook);
		setTableCountOnCardHeader($('#meta-details-opengraph-image-heading'), tableOpenGraphImage);
		setTableCountOnCardHeader($('#meta-details-opengraph-profile-heading'), tableOpenGraphProfile);
		setTableCountOnCardHeader($('#meta-details-opengraph-video-heading'), tableOpenGraphVideo);
		setTableCountOnCardHeader($('#meta-details-twitter-heading'), tableTwitter);
		setTableCountOnCardHeader($('#meta-details-dublincore-heading'), tableDublinCore);
		setTableCountOnCardHeader($('#meta-details-parsely-heading'), tableParsely);
		setTableCountOnCardHeader($('#meta-details-shareaholic-content-heading'), tableShareaholicContent);
		setTableCountOnCardHeader($('#meta-details-shareaholic-feature-heading'), tableShareaholicFeature);
		setTableCountOnCardHeader($('#meta-details-others-heading'), tableOthers);

		// display a hint if there are no meta elements (no accordions).
		setEmptyHintOnTabAccordion($('div#view-meta-details'), chrome.i18n.getMessage('no_meta_items'));
	};
}

/**
 * View for Summary.
 */
function viewSummary() {

	// get the current / active tab of the current window and send a message
	// to the content script to get the information from website.
	chrome.tabs.query({active: true, currentWindow: true}, tabs => {
		chrome.tabs.sendMessage(
			tabs[0].id,
			{info: INFO.SUMMARY},
			LoadSummary,
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
		const metasDisplay = (metas.filter(meta => metaOrder.indexOf(meta.name) > -1).sort((first, second) => metaOrder.indexOf(first.name) - metaOrder.indexOf(second.name)) || []).concat((metas.filter(meta => metaOrder.indexOf(meta.name) === -1) || []));

		// iterate through all meta items to set on table with specific formatting and information if needed.
		metasDisplay.map(meta => meta.name).filter((value, index, self) => self.indexOf(value) === index).forEach(function(name) {
			const items = metasDisplay.filter(meta => meta.name === name);

			// check how many items are available. on multiple values display the values as list.
			if (items.length === 1) {
				if (name === 'canonical') {
					tableSummary.children('tbody').append(getInformationRow(name + (items[0].value === tabUrl ? '<span class="info d-block">self-referential</span>' : ''), items[0].value));
				} else {
					if (isColor(items[0].value)) {
						tableSummary.children('tbody').append(getInformationRow(name, getFormattedColorValue(items[0].value), undefined, undefined, true));
					} else {
						tableSummary.children('tbody').append(getInformationRow(name, items[0].value));
					}
				}
			} else if (items.length > 1) {
				if (name === 'theme-color') {
					tableSummary.children('tbody').append(`<tr><td>${name}</td><td>${items.map(metaItem => getFormattedColorValue(metaItem.value)).join('')}</td></tr>`);
				} else {
					tableSummary.children('tbody').append(`<tr><td>${name}</td><td><ul><li>${items.map(metaItem => escapeHTML(metaItem.value)).join('</li><li>')}</li></ul></td></tr>`);
				}
			}
		});

		// function to group by a specific property.
		// this function will be used to group the identifiers of Google Analytics and Google Tag Manager.
		const groupBy = key => array =>
			array.reduce((objectsByKeyValue, obj) => {
				objectsByKeyValue[obj[key]] = (objectsByKeyValue[obj[key]] || []).concat(obj.source).filter((value, index, self) => self.indexOf(value) === index);
				return objectsByKeyValue;
			}, {});

		// display the Google Analytics Tracking information of the website.
		if (analytics.identifiers.length > 0 || analytics.files.length > 0) {
			let info = [];
			const groups = groupBy('id')(analytics.identifiers);
			info = info.concat(Object.keys(groups).map(identifier => `${identifier} (<i>${groups[identifier].join(' / ')}</i>)`));
			info = info.concat(analytics.files.map(item => item.original).filter((value, index, self) => self.indexOf(value) === index));
			tableSummary.children('tbody').append(`<tr><td>Google Analytics</td><td>${getFormattedArrayValue(info.filter(item => item !== null))}</td></tr>`);
		}

		// display the Google Tag Manager information of the website.
		if (tagmanager.identifiers.length > 0 || tagmanager.files.length > 0) {
			let info = [];
			const groups = groupBy('id')(tagmanager.identifiers);
			info = info.concat(Object.keys(groups).map(identifier => `${identifier} (<i>${groups[identifier].join(' / ')}</i>)`));
			info = info.concat(tagmanager.files.map(item => item.original).filter((value, index, self) => self.indexOf(value) === index));
			tableSummary.children('tbody').append(`<tr><td>Google Tag Manager</td><td>${getFormattedArrayValue(info.filter(item => item !== null))}</td></tr>`);
		}

		// if there are no items display a hint.
		setEmptyHint(tableSummary, chrome.i18n.getMessage('no_summary_items'));
	};
}

/**
 * View for Files.
 */
function viewFiles() {

	// get the current / active tab of the current window and send a message
	// to the content script to get the information from website.
	chrome.tabs.query({active: true, currentWindow: true}, tabs => {
		chrome.tabs.sendMessage(
			tabs[0].id,
			{info: INFO.FILES},
			LoadFiles,
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
		const domainsStylesheet = getDomains(filesStylesheet.map(file => file.url.href));
		const domainsJavaScript = getDomains(filesJavaScript.map(file => file.url.href));

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
				tableFilesStylesheet.find(`tbody > tr#stylesheet-${index} td`).append(getInformation('media', file.media.trim()));
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
				tableFilesJavaScript.find(`tbody tr#javascript-${index} td`).append(getInformation('async'));
			}

			// check whether the charset property exists and add the additional information.
			if (file.charset) {
				tableFilesJavaScript.find(`tbody tr#javascript-${index} td`).append(getInformation('charset', file.charset.trim()));
			}

			// check whether the file is a Google Analytics file and add a additional information.
			if (filesGoogleAnalytics.findIndex(fileGA => fileGA.original === file.original) > -1) {
				tableFilesJavaScript.find(`tbody tr#javascript-${index} td`).append(getInformation('Google Analytics', ''));
			}

			// check whether the file is a Google Tag Manager file and add a additional information.
			if (filesGoogleTagManager.findIndex(fileGTM => fileGTM.original === file.original) > -1) {
				tableFilesJavaScript.find(`tbody tr#javascript-${index} td`).append(getInformation('Google Tag Manager', ''));
			}
		});

		// set all the stylesheet domains to the table.
		domainsStylesheet.filter((value, index, self) => self.indexOf(value) === index).filter(domain => domain.trim() !== '').sort().forEach(function(domain) {
			tableStylesheetDomains.children('tbody').append(getInformationRow(domain, domainsStylesheet.filter(domainItem => domainItem === domain).length));
		});

		// set all the JavaScript domains to the table.
		domainsJavaScript.filter((value, index, self) => self.indexOf(value) === index).filter(domain => domain.trim() !== '').sort().forEach(function(domain) {
			tableJavaScriptDomains.children('tbody').append(getInformationRow(domain, domainsJavaScript.filter(domainItem => domainItem === domain).length));
		});

		// create an array with all special files.
		const filesSpecial = [];
		filesSpecial.push(`${(new URL(tabUrl)).origin}/sitemap.xml`);
		filesSpecial.push(`${(new URL(tabUrl)).origin}/robots.txt`);

		// check for the special files and add to the table if available.
		filesSpecial.forEach(function(file, index) {
			fetch(file).then(function(response) {
				if (response.status == 200) {
					tableFilesSpecial.children('tbody').append(`<tr id="special-${index}"><td><a href="${file}" target="_blank">${file}</a></td></tr>`);
					setTableCountOnCardHeader($('#special-heading'), tableFilesSpecial);

					// display a hint if there are no meta elements (no accordions).
					setEmptyHintOnTabAccordion($('div#view-files'), chrome.i18n.getMessage('no_file_items'));
				}
			});
		});

		// set the count of rows / items to the card header.
		setTableCountOnCardHeader($('#stylesheet-heading'), tableFilesStylesheet);
		setTableCountOnCardHeader($('#javascript-heading'), tableFilesJavaScript);
		setTableCountOnCardHeader($('#special-heading'), tableFilesSpecial);

		// display a hint if there are no meta elements (no accordions).
		setEmptyHintOnTabAccordion($('div#view-files'), chrome.i18n.getMessage('no_file_items'));
	};
}

/**
 * View for Header.
 */
function viewHeader() {
	$('html, body').animate({scrollTop: '0px'}, 0);

	// get the tab and table of the headers list.
	const tabHeaders = $('div#view-headers');
	const tableHeaders = $('table#info-headers', tabHeaders);

	// remove all available header information.
	tableHeaders.children('tbody').empty();

	// fetch the header information of the current url.
	fetch(tabUrl).then(function(response) {

		// set every information of the header to the table.
		for (const header of response.headers.entries()) {
			tableHeaders.children('tbody').append(getInformationRow(header[0], header[1]));
		}

		// set the status of the response to the table.
		tableHeaders.children('tbody').append(getInformationRow('HTTP Status', response.status));
		tableHeaders.children('tbody').append(getInformationRow('HTTP Version', response.statusText.trim() === '' ? 'HTTP/2' : 'HTTP/1'));
	});
}

/**
 * View for Tools.
 */
function viewTools() {
	$('html, body').animate({scrollTop: '0px'}, 0);

	// get the tab and table of the tools list.
	const tabTools = $('div#view-tools');
	const tableTools = $('table#info-tools', tabTools);

	// remove all available tools.
	tableTools.children('tbody').empty();

	// get the encoded url to set on a url as parameter.
	const encodedUrl = encodeURIComponent(tabUrl);
	const encodedUrlDomain = encodeURIComponent(tabUrlDomain);

	// add the tool "Page Speed Insights" to the table.
	tableTools.children('tbody').append(getToolsItem(
		chrome.i18n.getMessage('tools_pagespeed_insights_title'),
		chrome.i18n.getMessage('tools_pagespeed_insights_description'),
		`https://developers.google.com/speed/pagespeed/insights/?url=${encodedUrl}`,
	));

	// add the tool "W3C CSS Validation" to the table.
	tableTools.children('tbody').append(getToolsItem(
		chrome.i18n.getMessage('tools_w3c_css_validation_title'),
		chrome.i18n.getMessage('tools_w3c_css_validation_description'),
		`https://jigsaw.w3.org/css-validator/validator?uri=${encodedUrl}`,
	));

	// add the tool "Nu HTML checker" to the table.
	tableTools.children('tbody').append(getToolsItem(
		chrome.i18n.getMessage('tools_nu_html_checker_title'),
		chrome.i18n.getMessage('tools_nu_html_checker_description'),
		`https://validator.w3.org/nu/?doc=${encodedUrl}`,
	));

	// add the tool "GTmetrix" to the table.
	tableTools.children('tbody').append(getToolsItem(
		chrome.i18n.getMessage('tools_gtmetrix_title'),
		chrome.i18n.getMessage('tools_gtmetrix_description'),
		`https://gtmetrix.com/?url=${encodedUrl}`,
	));

	// add the tool "Google Search Console Rich Result Test" to the table.
	tableTools.children('tbody').append(getToolsItem(
		chrome.i18n.getMessage('tools_gsc_rich_results_title'),
		chrome.i18n.getMessage('tools_gsc_rich_results_description'),
		`https://search.google.com/test/rich-results?url=${encodedUrl}`,
	));

	// add the tool "Google Search Console Mobile Friendly Test" to the table.
	tableTools.children('tbody').append(getToolsItem(
		chrome.i18n.getMessage('tools_gsc_mobile_friendly_title'),
		chrome.i18n.getMessage('tools_gsc_mobile_friendly_description'),
		`https://search.google.com/test/mobile-friendly?url=${encodedUrl}`,
	));

	// add the tool "Security Headers" to the table.
	tableTools.children('tbody').append(getToolsItem(
		chrome.i18n.getMessage('tools_securityheaders_title'),
		chrome.i18n.getMessage('tools_securityheaders_description'),
		`https://securityheaders.com/?q=${encodedUrl}&hide=on&followRedirects=on`,
	));

	// add the tool "SSL Server Test (Powered by Qualys SSL Labs)" to the table.
	tableTools.children('tbody').append(getToolsItem(
		chrome.i18n.getMessage('tools_ssl_server_test_title'),
		chrome.i18n.getMessage('tools_ssl_server_test_description'),
		`https://www.ssllabs.com/ssltest/analyze.html?d=${encodedUrlDomain}&hideResults=on&latest`,
	));

	// set the font color of the about links to red if the chrome extension is in development environment.
	if (chrome.runtime.id !== storeId) {
		$('div.about a').css('color', '#f00');
	}
}

/**
 * View for Headings.
 */
function viewHeadings() {

	// get the current / active tab of the current window and send a message
	// to the content script to get the information of the website.
	chrome.tabs.query({active: true, currentWindow: true}, tabs => {
		chrome.tabs.sendMessage(
			tabs[0].id,
			{info: INFO.HEADINGS},
			LoadHeadings,
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
		resetHeadingFilter();

		// iterate through the different levels of the headings and set the stats.
		for (level = 1; level <= 6; level++) {
			tableHeadingsStatistics.find(`td[id="headings-h${level}"]`).text(headings.filter(heading => heading.type === `h${level}`).length);
			$(`td[id="headings-h${level}"]`).on('click', {'level': level}, callbackHeadingFilter);
		}

		// set the total count of headings to the table.
		tableHeadingsStatistics.find('td[id="headings-all"]').text(headings.length);

		// add all found headings to the table.
		headings.forEach(function(heading) {
			tableHeadings.children('tbody').append(`<tr class="level-${heading.type} is-empty"><td><span>${heading.type}</span>${escapeHTML(heading.text)}${getTextWordInformation(heading.text, true)}</td></tr>`);
		});

		// set a hint if there are no headings on the website.
		setEmptyHint(tableHeadings, chrome.i18n.getMessage('no_heading_items'));

		// set the count of found errors and warnings.
		setTableCountOnCardHeader($('#headings-errors-heading'), tableHeadingsErrors);
	};
}

/**
 * View for Images.
 */
function viewImages() {

	// get the current / active tab of the current window and send a message
	// to the content script to get the information of the website.
	chrome.tabs.query({active: true, currentWindow: true}, tabs => {
		chrome.tabs.sendMessage(
			tabs[0].id,
			{info: INFO.IMAGES},
			LoadImages,
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
		const domains = getDomains(images.map(image => image.source));

		// remove all rows of the images, icons and domains table.
		tableImages.children('tbody').empty();
		tableImagesIcons.children('tbody').empty();
		tableImagesDomains.children('tbody').empty();

		// set all the images to the table.
		images.filter(image => (image.source || '').toString().trim() !== '').forEach(function(image, index) {
			tableImages.children('tbody').append(`<tr id="img-${index}"><td><a target="_blank" href="${image.source}">${image.src}</a></td></tr>`);
			showImagePreview($(`tbody tr#img-${index} td`, tableImages), image.source);

			// set the attribute information to the row.
			for (const attribute of ['alt', 'title']) {
				if ((image[attribute] || '').toString().trim() !== '') {
					tableImages.find(`tbody tr#img-${index} td`).append(getInformation(attribute, (image[attribute] || '').toString().trim()));
				}
			}

			// set the image information of the image itself.
			setImageInfo(tableImages.find(`tbody tr#img-${index} td`), image.source);
		});

		// set all the domains to the table.
		domains.filter((value, index, self) => self.indexOf(value) === index).sort().forEach(function(domain) {
			tableImagesDomains.children('tbody').append(getInformationRow(domain, domains.filter(domainItem => domainItem === domain).length));
		});

		// set all the icons to the table.
		icons.filter(icon => (icon.href || '').toString().trim() !== '').forEach(function(icon, index) {
			tableImagesIcons.children('tbody').append(`<tr id="icon-${index}"><td><a target="_blank" href="${icon.source}">${icon.href}</a></td></tr>`);
			showImagePreview($(`tr#icon-${index} td`, tableImagesIcons), icon.source);

			// set the attribute information to the row.
			for (const attribute of ['type', 'sizes']) {
				if ((icon[attribute] || '').toString().trim() !== '') {
					tableImagesIcons.find(`tbody tr#icon-${index} td`).append(getInformation(attribute, (icon[attribute] || '').toString().trim()));
				}
			}

			// set the image information of the icon itself.
			setImageInfo(tableImagesIcons.find(`tbody tr#icon-${index} td`), icon.source);
		});

		// set hints on empty tables.
		setEmptyHint(tableImages, chrome.i18n.getMessage('no_items', chrome.i18n.getMessage('images_lc')));
		setEmptyHint(tableImagesDomains, chrome.i18n.getMessage('no_domain_items', chrome.i18n.getMessage('images_lc')));
		setEmptyHint(tableImagesIcons, chrome.i18n.getMessage('no_items', chrome.i18n.getMessage('icons_lc')));

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
function viewHyperlinks() {

	// get the current / active tab of the current window and send a message
	// to the content script to get the information of the website.
	chrome.tabs.query({active: true, currentWindow: true}, tabs => {
		chrome.tabs.sendMessage(
			tabs[0].id,
			{info: INFO.LINKS},
			LoadHyperlinks,
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
		const domains = getDomains(hyperlinks.filter(link => link.url !== undefined).map(link => link.url.href));

		// set all the hyperlinks with href value to the table.
		// don't show the hyperlinks with empty href attribute.
		hyperlinks.filter(hyperlink => hyperlink.href !== '').forEach(function(hyperlink, index) {
			tableHyperlinks.children('tbody').append(`<tr id="link-${index}"><td><a target="_blank" href="${(hyperlink.url !== undefined) ? hyperlink.url.href : ''}">${hyperlink.href}</a></td></tr>`);

			// set the attribute information to the row.
			for (const attribute of ['rel', 'target', 'title']) {
				if ((hyperlink[attribute] || '').toString().trim() !== '') {
					tableHyperlinks.find(`tbody tr#link-${index} td`).append(getInformation(attribute, (hyperlink[attribute] || '').toString().trim()));
				}
			}
		});

		// set all the hyperlink domains to the table.
		domains.filter((value, index, self) => self.indexOf(value) === index).sort().forEach(function(domain) {
			tableDomains.children('tbody').append(getInformationRow(domain, domains.filter(domainItem => domainItem === domain).length));
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
			for (const attribute of ['title', 'hreflang']) {
				if ((alternates[attribute] || '').toString().trim() !== '') {
					tableAlternate.find(`tbody tr#alternate-${index} td`).append(getInformation(attribute, (alternates[attribute] || '').toString().trim()));
				}
			}
		});

		// set hints on empty tables.
		setEmptyHint(tableHyperlinks, chrome.i18n.getMessage('no_items', chrome.i18n.getMessage('links_lc')));
		setEmptyHint(tableAlternate, chrome.i18n.getMessage('no_alternate_items'));
		setEmptyHint(tableDomains, chrome.i18n.getMessage('no_domain_items', chrome.i18n.getMessage('links_lc')));
		setEmptyHint(tablePreconnect, chrome.i18n.getMessage('no_preconnect_items'));
		setEmptyHint(tableDnsPrefetch, chrome.i18n.getMessage('no_dns_prefetch_items'));
		setEmptyHint(tablePreload, chrome.i18n.getMessage('no_preload_items'));

		// set the statistics for the hyperlinks.
		tableHyperlinksStatistics.find('td[id="hyperlink-stats-all"]').text(hyperlinks.length);
		tableHyperlinksStatistics.find('td[id="hyperlink-stats-all-unique"]').text(hyperlinks.filter(link => link.url !== undefined).map(link => link.url.href).filter((value, index, self) => self.indexOf(value) === index).length);
		tableHyperlinksStatistics.find('td[id="hyperlink-stats-internal"]').text(hyperlinks.filter(link => link.url !== undefined && link.url.href.startsWith(tabUrlOrigin) === true).length);
		tableHyperlinksStatistics.find('td[id="hyperlink-stats-internal-unique"]').text(hyperlinks.filter(link => link.url !== undefined && link.url.href.startsWith(tabUrlOrigin) === true).map(link => link.url.href).filter((value, index, self) => self.indexOf(value) === index).length);
		tableHyperlinksStatistics.find('td[id="hyperlink-stats-external"]').text(hyperlinks.filter(link => link.url !== undefined && link.url.href.startsWith(tabUrlOrigin) === false).length);
		tableHyperlinksStatistics.find('td[id="hyperlink-stats-external-unique"]').text(hyperlinks.filter(link => link.url !== undefined && link.url.href.startsWith(tabUrlOrigin) === false).map(link => link.url.href).filter((value, index, self) => self.indexOf(value) === index).length);

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
