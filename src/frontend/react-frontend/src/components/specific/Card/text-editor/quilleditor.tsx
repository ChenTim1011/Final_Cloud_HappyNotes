// Import React and necessary hooks
import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css"; // Use the bubble theme styles
import "./quilleditor.css"; // Import custom styles

// Define supported formats for the editor
const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "link",
  "image",
  "code-block",
];

// Define the toolbar module
const modules = {
  toolbar: [
    [{ header: [1, 2, false] }], // Header options
    ["bold", "italic", "underline", "strike"], // Text styles
    [{ list: "ordered" }, { list: "bullet" }], // Ordered and unordered lists
    ["link", "image", "code-block"], // Insert links, images, and code blocks
  ],
};

interface QuillEditorProps {
  content: string; // Initial content of the editor
  handleContentChange2: (content: string) => void; // Callback for content change
  readOnly?: boolean; // Read-only mode flag
  theme?: "bubble" | "snow"; // Quill theme
  onHeightChange?: (height: number) => void; // Callback for height change
}

const QuillEditor: React.FC<QuillEditorProps> = ({
  content,
  handleContentChange2,
  readOnly = false,
  theme = "bubble", // Default to the bubble theme
  onHeightChange,
}) => {
  const [value, setValue] = useState<string>(content); // State to manage editor content
  const editorRef = useRef<HTMLDivElement>(null); // Reference to the editor container

  // Handle content changes
  const handleChange = (content: string) => {
    setValue(content); // Update local state
    handleContentChange2(content); // Trigger the callback to pass changes
  };

  // Adjust the editor height dynamically based on content using useLayoutEffect
  useLayoutEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current.querySelector(".ql-editor");
      if (editor) {
        // Reset height to recalculate
        (editor as HTMLElement).style.height = "auto";
        // Set new height based on scrollHeight
        const newHeight = (editor as HTMLElement).scrollHeight;
        editorRef.current.style.height = `${newHeight}px`;
        // Call the onHeightChange callback if provided
        if (onHeightChange) {
          onHeightChange(newHeight);
        }
      }
    }
  }, [value, readOnly, onHeightChange]);

  // Sync external content changes (e.g., updates from the parent component)
  useEffect(() => {
    setValue(content);
  }, [content]);

  return (
    <div
      ref={editorRef}
      className={`editor-container border border-gray-300 p-2 overflow-visible ${
        readOnly ? "cursor-default" : "cursor-text"
      }`}
      style={{ position: "relative", zIndex: 10000, height: '100%' }} // Ensure relative positioning, z-index, and full container height
    >
      <ReactQuill
        value={value}
        onChange={handleChange}
        modules={readOnly ? {} : modules} // Define modules based on read-only mode
        formats={formats}
        placeholder="Please enter content..."
        readOnly={readOnly}
        theme={theme} // Use the bubble theme
        style={{ height: "100%", flexGrow: 1, zIndex: 10001 }} // Ensure the editor fills the container and enables scrolling
      />
    </div>
  );
};

export default QuillEditor;
