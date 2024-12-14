import React, { useState, useRef } from "react";
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
}

const QuillEditor: React.FC<QuillEditorProps> = ({ content, handleContentChange2 }) => {
  const [value, setValue] = useState<string>(content); // State to manage editor content
  const editorRef = useRef<HTMLDivElement>(null); // Reference to the editor container

  // Handle content changes in the editor
  const handleChange = (content: string) => {
    setValue(content); // Update local state
    handleContentChange2(content); // Trigger the callback to propagate changes
  };

  // Handle mouse drag for vertical scrolling
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const editor = editorRef.current;
    if (!editor) return;

    let startY = e.clientY;
    const startScrollTop = editor.scrollTop;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startY;
      editor.scrollTop = startScrollTop - deltaY;
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      ref={editorRef}
      onMouseDown={handleMouseDown}
      className="border border-gray-300 p-2 min-h-[400px] max-h-[600px] overflow-y-auto cursor-grab scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
    >
      <ReactQuill
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder="Please enter content..."
      />
    </div>
  );
};

export default QuillEditor;
