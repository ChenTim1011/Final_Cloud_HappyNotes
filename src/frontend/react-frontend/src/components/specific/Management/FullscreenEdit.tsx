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
        <div className="space-y-6 p-6 bg-[#F7F1F0] border border-[#C3A6A0] rounded-xl shadow-lg">
          {/* Header with title and close button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-serif font-bold text-[#262220]">編輯卡片</h2>
            <button
              onClick={onCancel}
              className="text-[#A15C38] hover:text-[#8B4C34] focus:outline-none text-2xl"
              title="Close"
            >
              &times;
            </button>
          </div>
      
          {/* Title Input */}
          <Input
            value={card.cardTitle}
            onChange={(e) => onChange({ cardTitle: e.target.value })}
            className="text-2xl font-serif font-medium text-[#262220] border border-[#C3A6A0] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#A15C38]"
            placeholder="卡片標題"
          />
      
          {/* Content Editor */}
          <div className="bg-white rounded-lg shadow-inner p-4">
            <QuillEditor
              content={card.content}
              handleContentChange2={(content) => onChange({ content })}
              readOnly={false}
              theme="snow"
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
      );
};

export default FullscreenEdit;
