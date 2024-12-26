// src/components/specific/Management/FullscreenEdit.tsx

import React from 'react';
import { CardData } from '@/interfaces/Card/CardData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import QuillEditor from '@/components/specific/Card/text-editor/quilleditor';

interface FullscreenEditProps {
    card: CardData;
    onChange: (updatedCard: Partial<CardData>) => void;
    onSave: () => void;
    onCancel: () => void;
}

const FullscreenEdit: React.FC<FullscreenEditProps> = ({ card, onChange, onSave, onCancel }) => {
    return (
        <div className="space-y-4">
            {/* Header with title and close button */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold">編輯卡片</h2>
                <button
                    onClick={onCancel}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none text-2xl"
                    title="Close"
                >
                    &times;
                </button>
            </div>

            {/* Title Input */}
            <Input
                value={card.cardTitle}
                onChange={(e) => onChange({ cardTitle: e.target.value })}
                className="text-3xl font-bold"
                placeholder="Card Title"
            />

            {/* Content Editor */}
            <QuillEditor
                content={card.content}
                handleContentChange2={(content) => onChange({ content })}
                readOnly={false}
                theme="snow"
                onHeightChange={() => { }}
            />

            {/* Save and Cancel Buttons */}
            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onCancel}>
                    取消編輯
                </Button>
                <Button onClick={onSave}>
                    儲存
                </Button>
            </div>
        </div>
    );
};

export default FullscreenEdit;
