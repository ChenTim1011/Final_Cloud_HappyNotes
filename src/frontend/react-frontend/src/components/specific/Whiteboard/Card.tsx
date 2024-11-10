// react-frontend/src/components/specific/Whiteboard/Card.tsx

import React, { useState } from 'react';
import { CardData } from '@/interfaces/Card/CardData';

// Interface for Card component props extending CardData
interface CardProps extends CardData {
    onUpdateCard: (cardId: string, updatedFields: Partial<CardData>) => void;
    onDelete: (cardId: string) => void; 
    isSelected: boolean; 
    onSelect: (cardId: string) => void; 
}

const Card: React.FC<CardProps> = ({
    _id,
    cardTitle,
    content,
    dueDate,
    tag,
    foldOrNot,
    position,
    dimensions,
    connection,
    connectionBy,
    comments,
    onUpdateCard,
    onDelete, 
    isSelected, 
    onSelect, 
}) => {
    // Local state for editing mode and input values
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editedTitle, setEditedTitle] = useState<string>(cardTitle);
    const [editedContent, setEditedContent] = useState<string>(content);
    const [isFolded, setIsFolded] = useState<boolean>(!!foldOrNot);

    // Function to save edited content and update the card
    const handleSave = () => {
        if (_id) {
            onUpdateCard(_id, { cardTitle: editedTitle, content: editedContent, updatedAt: new Date() });
            setIsEditing(false);
        }
    };

    // Error handling: Ensure card ID is defined
    if (!_id) {
        console.error("Card component received undefined id");
        return null;
    }

    // Function to handle card deletion with confirmation
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering onSelect
        const confirmDelete = window.confirm('你確定要刪除卡片嗎?');
        if (confirmDelete) {
            onDelete(_id);
        }
    };
    const handleToggleFold = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering onSelect
        setIsFolded(!isFolded);
        onUpdateCard(_id, { foldOrNot: !isFolded }); // 更新後端的 foldOrNot 狀態
    };


    return (
        <div
            className={`bg-blue-100 border border-blue-300 p-4 rounded shadow relative cursor-pointer ${
                isSelected ? 'ring-4 ring-blue-500' : ''
            }`}
            style={{
                position: 'absolute',
                top: position.y,
                left: position.x,
                width: dimensions.width,
                height: isFolded ? 'auto' : dimensions.height, // 折疊時高度自適應
                overflow: 'hidden',
            }}
            onDoubleClick={() => setIsEditing(true)}
            onClick={() => onSelect(_id)} 
        >
             {/* Fold button */}
             <button
                onClick={handleToggleFold}
                className="absolute top-0 left-2  text-gray-500 hover:text-gray-700 focus:outline-none"
                style={{ fontSize: '1.25rem' }} 
                title={isFolded ? '展開卡片' : '摺疊卡片'}
            >
                {isFolded ? '+' : '-'}
            </button>


            {/** Delete button */}
            <button
                onClick={handleDelete}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 focus:outline-none"
                title="Delete Card"
            >
                &times;
            </button>

            {isEditing ? (
                <>
                    {/** Input for editing the card title */}
                    <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="w-full px-2 py-1 border rounded mb-2"
                        placeholder="Enter card title"
                    />
                    {/** Textarea for editing the card content */}
                    <textarea
                        placeholder="Enter content here"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full h-24 p-2 border rounded"
                    />
                    {/** Button to save changes */}
                    <button
                        onClick={handleSave}
                        className="mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none"
                    >
                        Save
                    </button>
                </>
            ) : (
                <>
                    {/** Display the card title and content */}
                    <h3 className="text-lg font-semibold">{cardTitle}</h3>
                    {!isFolded && <p className="mt-2">{content}</p>}
                </>
            )}
        </div>
    );
};

export default Card;
