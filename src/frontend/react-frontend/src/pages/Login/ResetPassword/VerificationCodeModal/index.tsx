// src/pages/Login/ResetPassword/VerificationCodeModal.tsx - VerificationCode

import React, { useRef, useState } from "react";
import { updateUser, getUserByName } from '@/services/userService';
import { UserUpdateData } from '@/interfaces/User/UserUpdateData';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const VerificationCodeModal: React.FC<{
  onClose: () => void;
  onSubmit: (code: string) => void;
}> = ({ onClose, onSubmit }) => {
  const codeRef = useRef<HTMLInputElement | null>(null);

  const handleConfirm = () => {
    const code = codeRef.current?.value || '';
    if (!code) {
      toast.error('請輸入驗證碼');
      return;
    }
    onSubmit(code);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-lg font-semibold mb-4">請輸入驗證碼</h2>
        <input
          ref={codeRef}
          type="text"
          placeholder="輸入驗證碼"
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="mt-4 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            確認
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationCodeModal