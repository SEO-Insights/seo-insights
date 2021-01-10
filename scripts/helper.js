//https://stackoverflow.com/a/30335883/3840840
function GetWordCount(str) {
    str = str.replace(/(^\s*)|(\s*$)/gi, '');  // remove starting and ending spaces.
    str = str.replace(/-\s/gi, ''); // replace word-break with empty string to get one word.
    str = str.replace(/\s/gi, ' ');  // replace all spaces, tabs and new lines with a space.
    str = str.replace(/\s{2,}/gi, ' '); // replace two ore more spaces with a single space.
    return str.split(' ').filter(str => str.match(/[0-9a-z\u00C0-\u017F]/gi)).length;
}

//https://stackoverflow.com/a/35970186/3840840
function invertColor(hex, bw) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        // http://stackoverflow.com/a/3943023/112731
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + padZero(r) + padZero(g) + padZero(b);
}

var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
};

function EscapeHTML(str) {
    return String(str).replace(/[&<>"'\/]/g, function(s) {
        return entityMap[s];
    });
}

/**
 * The enum for the different subjects of this chrome extension.
 */
var SUBJECT = {
    FILE: 'file',
    HEADING: 'heading',
    HYPERLINK: 'hyperlink',
    IMAGE: 'image',
    META: 'meta',
    SUMMARY: 'summary',
    HEADER: 'header'
};

/**
 * The enum for different sources of this chrome extension.
 */
var SOURCE = {
    POPUP: 'popup'
};