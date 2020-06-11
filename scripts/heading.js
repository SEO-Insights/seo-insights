function GetString(value) {
    return (value || "").toString();
}

function GetHeadings() {
    let headings = [];

    $('h1, h2, h3, h4, h5, h6').each(function() {
        var strJustElementText = $(this).clone().children().remove().end().text();

        headings.push({
            'tag': this.tagName,
            'title': EscapeHTML(strJustElementText),
            'count_chars': strJustElementText.length,
            'count_words': GetWordCount(strJustElementText)
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