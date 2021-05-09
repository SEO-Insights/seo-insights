/**
 * The enum for the different information areas of this chrome extension.
 */
var INFO = {
	FILES: 'file',
	HEADER: 'header',
	HEADINGS: 'heading',
	IMAGES: 'images',
	LINKS: 'links',
	META: 'meta',
	SUMMARY: 'summary'
};

/**
 * Returns the base url of the website. It also considers the base url on meta information.
 * @returns The base url of the website.
 */
function GetBaseUrl() {
	const baseUrl = $('head > base').first().attr('href');

	//use the base url of the meta information if available.
	if (baseUrl) {
		return (new URL(baseUrl, (location.origin + location.pathname))).href;
	} else {
		return (new URL(location.origin + location.pathname)).href;
	}
}
