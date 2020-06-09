function GetString(value) {
    return (value || "").toString();
}

// https://stackoverflow.com/a/30335883/3840840
function GetWordsCount(value) {
    return GetString(value).split(' ').filter(function(str) {
        return str !== '';
    }).length;
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }

function GetHeadings() {
    let headings = [];

    $('h1, h2, h3, h4, h5, h6').each(function() {
        headings.push({
            'tag': this.tagName,
            'title': escapeHtml($(this).text()),
            'count_chars': $(this).text().length,
            'count_words': GetWordsCount($(this).text())
        });
    });

    let info = {
        'counts': {
            'all': headings.length,
            'h1': headings.filter(heading => GetString(heading.tag).trim() === "H1").length,
            'h2': headings.filter(heading => GetString(heading.tag).trim() === "H2").length,
            'h3': headings.filter(heading => GetString(heading.tag).trim() === "H3").length,
            'h4': headings.filter(heading => GetString(heading.tag).trim() === "H4").length,
            'h5': headings.filter(heading => GetString(heading.tag).trim() === "H5").length,
            'h6': headings.filter(heading => GetString(heading.tag).trim() === "H6").length
        },
        'headings': headings
    }

    return info;
}