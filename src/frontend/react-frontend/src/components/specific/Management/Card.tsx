// src/components/specific/Management/Card.tsx

import React from 'react';
import { CardData } from '@/interfaces/Card/CardData';
import Tag from '@/components/specific/Card/tag';
import './Card.css';
import { toast } from 'react-toastify';
import DOMPurify from 'dompurify';

interface CardProps extends CardData {
    onDelete: (cardId: string) => void;
    isSelected: boolean;
    onSelect: (cardId: string) => void;
    onCopyCard: (card: CardData) => void;
    onRightClick?: (e: React.MouseEvent, cardId: string) => void;
}

const Card: React.FC<CardProps> = React.memo(({
    _id,
    cardTitle,
    content,
    dueDate,
    tag,
    foldOrNot,
    connection,
    connectionBy,
    comments,
    onDelete,
    isSelected,
    onSelect,
    onCopyCard,
    onRightClick,
}) => {

    // Handle card click event
    const handleClick = () => {
        onSelect(_id);
    };

    // Handle right-click menu event
    const handleRightClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (onRightClick) {
            onRightClick(e, _id);
        }
    };

    // Handle delete button click
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering onSelect
        const confirmDelete = window.confirm('你確定要刪除這一張卡片嗎?');
        if (confirmDelete) {
            onDelete(_id);
        }
    };

    // Sanitize the HTML content
    const sanitizedContent = DOMPurify.sanitize(content);

    return (
        <div
            className={`card-container ${isSelected ? 'selected' : ''} bg-[#F7F1F0] border border-[#C3A6A0] shadow-md rounded-lg p-5`}
            onClick={handleClick}
            onContextMenu={handleRightClick}
        >
            <div className="card-content">
                {/* Header with Tag and Action Buttons */}
                <div className="flex justify-between items-center mb-4">
                    {/* Tag Component */}
                    <Tag currentTag={tag} onUpdateTag={() => { /* If we need to edit tag */ }} />

                    <div className="flex items-center space-x-2">
                        {/* Delete button */}
                        <button
                            onClick={handleDelete}
                            className="text-red-500 hover:text-red-700 focus:outline-none text-lg"
                            title="刪除卡片"
                        >
                            🗑️
                        </button>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-serif font-bold text-[#262220] mt-2">
                    {cardTitle}
                </h3>

                {/* Content Wrapper */}
                <div
                    className="ql-editor text-[#262220] font-normal mt-2 content-wrapper"
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
            </div>
        </div>
    );
});

export default Card;
