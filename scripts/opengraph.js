/**
 * The OpenGraph meta tags with additional information.
 *
 * source:
 *  - http://ogp.me/ns/ogp.me.ttl
 *  - https://ogp.me/#metadata
 */
var OpenGraphTags = [
    {name: 'og:url', description: 'The canonical URL of your object that will be used as its permanent ID in the graph, e.g. "http://www.imdb.com/title/tt0117500/".'},
    {name: 'og:type', description: 'The type of your object, e.g. "movie".  Depending on the type you specify, other properties may also be required.'},
    {name: 'og:title', description: 'The title of the object as it should appear within the graph, e.g. "The Rock".'},
    {name: 'og:locale', description: 'A Unix locale in which this markup is rendered.'},
    {name: 'og:image', description: 'An image URL which should represent your object within the graph.'},
    {name: 'og:image:secure_url', description: 'A secure image URL which should represent your object within the graph.'},
    {name: 'og:image:type', description: 'The mime type of an image.'},
    {name: 'og:image:width', description: 'The width of an image.'},
    {name: 'og:image:height', description: 'The height of an image.'},
    {name: 'og:video', description: 'A relevant video URL for your object.'},
    {name: 'og:video:secure_url', description: 'A relevant, secure video URL for your object.'},
    {name: 'og:video:type', description: 'The mime type of a video e.g. "application/x-shockwave-flash".'},
    {name: 'og:video:width', description: 'The width of a video.'},
    {name: 'og:video:height', description: 'The height of a video.'},
    {name: 'og:audio', description: 'A relevant audio URL for your object.'},
    {name: 'og:audio:secure_url', description: 'A relevant, secure audio URL for your object.'},
    {name: 'og:audio:type', description: 'The mime type of an audio file e.g. "application/mp3".'},
    {name: 'og:description', description: 'A one to two sentence description of your object.'},
    {name: 'og:site_name', description: 'If your object is part of a larger web site, the name which should be displayed for the overall site. e.g. "IMDb".'},
    {name: 'og:determiner', description: 'The word to precede the object\'s title in a sentence (e.g., "the" in "the statue of liberty").  Valid values are "a", "an", "the", "", and "auto".'}
];
