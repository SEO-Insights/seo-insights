class MetaInfo {
    name = '';
    value = '';
    count_chars = 0;
    count_words = 0;

    constructor(name, value, detailed = false) {
        this.name = name;
        this.value = (value || '').toString();

        if (detailed === true) {
            this.count_chars = this.value.length;
            this.count_words = GetWordsCount(this.value);
        }
    }
};

function GetHeadInformation() {
    return {
        'application-name': new MetaInfo('application-name', $('meta[name="application-name"]').attr('content')),
        'author': new MetaInfo('author', $('meta[name="author"]').attr('content')),
        'generator': new MetaInfo('generator', $('meta[name="generator"]').attr('content')),
        'keywords': new MetaInfo('keywords', $('meta[name="keywords"]').attr('content')),
        'referrer': new MetaInfo('referrer', $('meta[name="referrer"]').attr('content')),
        'theme-color': new MetaInfo('theme-color', $('meta[name="theme-color"]').attr('content')),
        'title': new MetaInfo('title', $('head > title').text(), true),
        'description': new MetaInfo('description', $('meta[name="description"]').attr('content'), true)
    };
}