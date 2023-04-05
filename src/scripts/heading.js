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

// create the namespace of SEO Insights if the namespace doesn't exist.
var SEOInsights = (SEOInsights || {});

/**
 * The Heading class of SEO Insights to get information of headings used on a website.
 */
SEOInsights.Heading = class Heading {

	/**
	 * Returns all headings of the specified context.
	 * @param {object} context The specified context to get all the headings.
	 * @returns {Array<object>} An array with all found headings of the specified context.
	 */
	static getHeadingsOfDocument(context = null) {
		const headings = [];

		// iterate through all headings of the specified context.
		// add all the headings of the specified context.
		$('h1, h2, h3, h4, h5, h6', context).each(function() {
			headings.push({
				text: ($(this).text() || '').toString().trim(),
				type: ($(this).prop('tagName') || '').toString().trim().toLowerCase(),
			});
		});

		// return all the found headings.
		return headings;
	}

	/**
	 * Returns all headings of the current website.
	 * @returns {Array<object>} An array with all found headings of the website.
	 */
	static getHeadings() {
		let headings = SEOInsights.Heading.getHeadingsOfDocument();

		// iterate through the frames of the page to get the headings of the available frames.
		// there are also blocked frames so we have to try to get the document of the frame.
		for (let frameIndex = 0; frameIndex < window.frames.length; frameIndex++) {
			try {
				headings = headings.concat(SEOInsights.Heading.getHeadingsOfDocument(window.frames[frameIndex].document));
			} catch(_e) {}
		}

		// return all the found headings of the website.
		return headings;
	}
};
