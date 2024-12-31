// server/utils/sanitize.js

const { JSDOM } = require("jsdom");
const createDOMPurify = require("dompurify");

// Create a DOM window
const window = new JSDOM("").window;

// Initialize
const DOMPurify = createDOMPurify(window);

/**
 * Clean up the HTML string to prevent XSS attacks
 * @param {string} dirty - original HTML string
 * @returns {string} - cleaned HTML string
 */
const sanitizeHTML = (dirty) => {
  return DOMPurify.sanitize(dirty, {
    // Add your custom configurations here
    ALLOWED_TAGS: [
      "b",
      "i",
      "em",
      "strong",
      "a",
      "p",
      "br",
      "ul",
      "li",
      "ol",
      "span",
      "div",
      "img",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
    ],
    ALLOWED_ATTR: ["href", "title", "target", "rel", "src", "alt", "style"],
  });
};

module.exports = sanitizeHTML;
