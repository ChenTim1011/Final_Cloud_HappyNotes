// server/utils/sanitize.js

const { JSDOM } = require("jsdom");
const createDOMPurify = require("dompurify");

// Create a DOM window
const window = new JSDOM("").window;

// Initialize
const DOMPurify = createDOMPurify(window);

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} dirty - original HTML string
 * @returns {string} - sanitized HTML string
 */
const sanitizeHTML = (dirty) => {
  return DOMPurify.sanitize(dirty, {
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
    ], // Only allow essential tags
    ALLOWED_ATTR: ["href", "title", "target", "rel", "src", "alt", "style"], // Allow only necessary attributes
    FORBID_ATTR: ["onerror", "onclick", "onload"], // Explicitly forbid event handlers
    FORBID_TAGS: ["script", "iframe", "object", "embed", "applet"], // Forbid dangerous tags
    ALLOWED_URI_REGEXP:
      /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i, // Restrict URI schemes
    WHOLE_DOCUMENT: false, // Only sanitize fragments, not entire documents
    RETURN_DOM_FRAGMENT: false, // Return sanitized string instead of DOM
  });
};

module.exports = sanitizeHTML;
