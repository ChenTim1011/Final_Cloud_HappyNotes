// src/components/specific/Card/text-editor/quilleditor.tsx

import React, { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Quill 樣式

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
  readOnly?: boolean; // 是否為只讀模式
  theme?: "snow" | "bubble"; // Quill 主題
  onHeightChange?: (height: number) => void; // Callback for height changes
}

const QuillEditor: React.FC<QuillEditorProps> = ({ 
  content, 
  handleContentChange2,
  readOnly = false,
  theme = "snow",
  onHeightChange
}) => {
  const [value, setValue] = useState<string>(content); // State to manage editor content
  const editorRef = useRef<HTMLDivElement>(null); // Reference to the editor container

  // Handle content changes in the editor
  const handleChange = (content: string) => {
    setValue(content); // Update local state
    handleContentChange2(content); // Trigger the callback to propagate changes
  };

  // Use useEffect to adjust editor height based on content
  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current.querySelector(".ql-editor");
      if (editor) {
        // Reset height to auto to recalculate
        (editor as HTMLElement).style.height = "auto";
        // Set new height based on scrollHeight
        const newHeight = Math.max(editor.scrollHeight, 400);
        editorRef.current.style.height = `${newHeight}px`;
        // Call onHeightChange callback if provided
        if (onHeightChange) {
          onHeightChange(newHeight);
        }
      }
    }
  }, [value, readOnly, onHeightChange]);

  return (
    <div
      ref={editorRef}
      className={`border border-gray-300 p-2 overflow-hidden ${
        readOnly ? "cursor-default" : "cursor-text"
      }`}
      style={{ minHeight: "150px" }} // Set minimum height
    >
      <ReactQuill
        value={value}
        onChange={handleChange}
        modules={readOnly ? {} : modules}
        formats={formats}
        placeholder="請輸入內容..."
        readOnly={readOnly}
        theme={theme}
        style={{ height: "auto" }} // Allow Quill editor to adjust height based on content
      />
    </div>
  );
};

export default QuillEditor;
