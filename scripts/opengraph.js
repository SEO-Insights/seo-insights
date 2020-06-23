/**
 * Class to structure the OpenGraph tag information.
 */
class OpenGraphTagInfo {
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }
}

/**
 * The OpenGraph meta tags with additional information.
 * 
 * source:
 *  - http://ogp.me/ns/ogp.me.ttl
 *  - https://ogp.me/#metadata
 */
let OpenGraphTags = [
    new OpenGraphTagInfo('og:url', 'The canonical URL of your object that will be used as its permanent ID in the graph, e.g. "http://www.imdb.com/title/tt0117500/".'),
    new OpenGraphTagInfo('og:type', 'The type of your object, e.g. "movie".  Depending on the type you specify, other properties may also be required.'),
    new OpenGraphTagInfo('og:title', 'The title of the object as it should appear within the graph, e.g. "The Rock".'),
    new OpenGraphTagInfo('og:locale', 'A Unix locale in which this markup is rendered.'),
    new OpenGraphTagInfo('og:image', 'An image URL which should represent your object within the graph.'),
    new OpenGraphTagInfo('og:image:secure_url', 'A secure image URL which should represent your object within the graph.'),
    new OpenGraphTagInfo('og:image:type', 'The mime type of an image.'),
    new OpenGraphTagInfo('og:image:width', 'The width of an image.'),
    new OpenGraphTagInfo('og:image:height', 'The height of an image.'),
    new OpenGraphTagInfo('og:video', 'A relevant video URL for your object.'),
    new OpenGraphTagInfo('og:video:secure_url', 'A relevant, secure video URL for your object.'),
    new OpenGraphTagInfo('og:video:type', 'The mime type of a video e.g. "application/x-shockwave-flash".'),
    new OpenGraphTagInfo('og:video:width', 'The width of a video.'),
    new OpenGraphTagInfo('og:video:height', 'The height of a video.'),
    new OpenGraphTagInfo('og:audio', 'A relevant audio URL for your object.'),
    new OpenGraphTagInfo('og:audio:secure_url', 'A relevant, secure audio URL for your object.'),
    new OpenGraphTagInfo('og:audio:type', 'The mime type of an audio file e.g. "application/mp3".'),
    new OpenGraphTagInfo('og:description', 'A one to two sentence description of your object.'),
    new OpenGraphTagInfo('og:site_name', 'If your object is part of a larger web site, the name which should be displayed for the overall site. e.g. "IMDb".'),
    new OpenGraphTagInfo('og:determiner', 'The word to precede the object\'s title in a sentence (e.g., "the" in "the statue of liberty").  Valid values are "a", "an", "the", "", and "auto".')
];