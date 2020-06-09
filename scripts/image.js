function GetImages() {
    var images = [];

    $('img').each(function() {
        images.push({
            'alt': this.alt,
            'src': this.src
        });
    });

    return {
        'count': {
            'all': images.length,
            'without_alt': images.filter(image => GetString(image.alt).trim() === "").length,
            'without_src': images.filter(image => GetString(image.src).trim() === "").length,
            'without_title': images.filter(image => GetString(image.title).trim() === "").length           
        },
        'images': images
    };
}