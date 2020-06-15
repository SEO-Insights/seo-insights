//https://stackoverflow.com/a/30335883/3840840
function GetWordCount(str) {
    str = str.replace(/(^\s*)|(\s*$)/gi, '');  // remove starting and ending spaces.
    str = str.replace(/-\s/gi, ''); // replace word-break with empty string to get one word.
    str = str.replace(/\s/gi, ' ');  // replace all spaces, tabs and new lines with a space.
    str = str.replace(/\s{2,}/gi, ' '); // replace two ore more spaces with a single space.
    return str.split(' ').filter(str => str.match(/[0-9a-z\u00C0-\u017F]/gi)).length;
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
    SUMMARY: 'summary'
};