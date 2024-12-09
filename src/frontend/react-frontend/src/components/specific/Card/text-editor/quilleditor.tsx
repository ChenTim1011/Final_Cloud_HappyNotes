import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Quill default styles

// Define the supported formats for the editor
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
  toolbar: {
    container: [
      [{ header: [1, 2, false] }], // Header options
      ["bold", "italic", "underline", "strike"], // Text styling
      [{ list: "ordered" }, { list: "bullet" }], // Ordered and unordered lists
      ["link", "image", "code-block"], // Insert links, images, and code blocks
    ],
  },
};

interface QuillEditorProps {
  content: string; // Initial content of the editor
  handleContentChange2: (content: string) => void; // Callback when content changes
}

const QuillEditor: React.FC<QuillEditorProps> = ({ content, handleContentChange2 }) => {
  // Initialize state with the provided content
  const [value, setValue] = useState<string>(content);

  // Handle changes in the editor content
  const handleChange = (content: string) => {
    setValue(content);
    handleContentChange2(content); // Trigger the callback to propagate changes
  };

  return (
    <div className="editor-container">
      <ReactQuill
        value={value} // Current editor content
        onChange={handleChange} // Update state and propagate changes
        modules={modules} // Toolbar modules
        formats={formats} // Supported formats
        placeholder="Please enter content..." // Placeholder text
      />
    </div>
  );
};

export default QuillEditor;
