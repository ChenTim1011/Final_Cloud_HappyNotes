import React, { useState } from 'react';

interface TagProps {
  currentTag?: string; // Current tag value
  onUpdateTag: (newTag: string) => void; // Method to update the tag
}

const Tag: React.FC<TagProps> = ({ currentTag = '', onUpdateTag }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedTag, setEditedTag] = useState<string>(currentTag);

  // Function to save the tag when editing is complete
  const handleSave = () => {
    setIsEditing(false);
    onUpdateTag(editedTag.trim());
  };

  // Handle double-click to enable editing mode
  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  // Handle key press events (Enter to save, Escape to cancel)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedTag(currentTag); // Reset to the original value
    }
  };

  return (
    <div className="mt-2">
      {isEditing ? (
        // Input field for editing the tag
        <input
          type="text"
          value={editedTag}
          onChange={(e) => setEditedTag(e.target.value)}
          onKeyDown={handleKeyPress}
          onBlur={handleSave} // Save when losing focus
          autoFocus
          title="Edit Tag"
          placeholder="Enter tag"
          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      ) : (
        // Display the tag value or "New Tag"
        <span
          onDoubleClick={handleDoubleClick}
          className="text-gray-700 cursor-pointer hover:text-blue-500"
        >
          標籤: {currentTag || '新的標籤'}
        </span>
      )}
    </div>
  );
};

export default Tag;
