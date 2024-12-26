// src/components/specific/Management/Card.tsx

import React from 'react';
import { CardData } from '@/interfaces/Card/CardData';
import Tag from '@/components/specific/Card/tag';
import './Card.css';
import { toast } from 'react-toastify';

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
        const confirmDelete = window.confirm('Are you sure you want to delete this card?');
        if (confirmDelete) {
            onDelete(_id);
        }
    };



    return (
        <div
            className={`card-container ${isSelected ? 'selected' : ''}`}
            onClick={handleClick}
            onContextMenu={handleRightClick}
        >
            <div className="card-content">
                {/* Header with buttons */}
                <div className="flex justify-between items-center mb-2">
                    {/* Tag Component */}
              
                    <Tag currentTag={tag} onUpdateTag={() => {}} /> {/* Update handler can be managed in Management */}
            
                    {/* Delete button */}
                    <button
                        onClick={handleDelete}
                        className="text-red-500 hover:text-red-700 focus:outline-none"
                        title="Delete Card"
                    >
                        🗑️
                    </button>
                </div>
            
                {/* Title */}
                <h3 className="text-2xl font-semibold mt-2">{cardTitle}</h3>

                {/* Content Wrapper with Scroll */}
                <div className="content-wrapper">
                    <div
                        className="ql-editor"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>
            </div>
        </div>
    );
});

export default Card;
