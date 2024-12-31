// src/components/specific/Management/FullscreenEdit.tsx

import React from 'react';
import { CardData } from '@/interfaces/Card/CardData';
import { Input } from '@/components/ui/input';
import QuillEditor from '@/components/specific/Card/text-editor/quilleditor';
import DOMPurify from 'dompurify'; 

interface FullscreenEditProps {
    card: CardData;
    onChange: (updatedCard: Partial<CardData>) => void;
    onSave: () => void;
    onCancel: () => void;
}

const FullscreenEdit: React.FC<FullscreenEditProps> = ({ card, onChange, onSave, onCancel }) => {
   
    const handleContentChange = (content: string) => {
        const sanitized = DOMPurify.sanitize(content);
        onChange({ content: sanitized });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="w-full h-full p-6 bg-[#F7F1F0] border border-[#C3A6A0] rounded-none shadow-lg overflow-auto">
                {/* Header with title and close button */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-serif font-bold text-[#262220]">編輯卡片</h2>
                    <button
                        onClick={onCancel}
                        className="text-[#A15C38] hover:text-[#8B4C34] focus:outline-none text-2xl"
                        title="關閉"
                    >
                        &times;
                    </button>
                </div>

                {/* Title Input */}
                <Input
                    value={card.cardTitle}
                    onChange={(e) => onChange({ cardTitle: e.target.value })}
                    className="text-2xl font-serif font-medium text-[#262220] border border-[#C3A6A0] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#A15C38] w-full"
                    placeholder="卡片標題"
                />

                {/* Content Editor */}
                <div className="bg-white rounded-lg shadow-inner p-4 mt-4">
                    <QuillEditor
                        content={card.content}
                        handleContentChange2={handleContentChange} 
                        readOnly={false}
                        theme="bubble"
                        onHeightChange={() => {}}
                    />
                </div>

                {/* Save and Cancel Buttons */}
                <div className="flex justify-end gap-4 pt-6">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 border border-[#C3A6A0] text-[#262220] rounded-lg hover:bg-[#EDE7E4] transition duration-200 focus:outline-none"
                    >
                        取消編輯
                    </button>
                    <button
                        onClick={onSave}
                        className="px-6 py-2 bg-[#A15C38] text-white rounded-lg hover:bg-[#8B4C34] transition duration-200 focus:outline-none shadow-md"
                    >
                        儲存
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FullscreenEdit;
