// src/pages/Login/ResetPassword/VerificationCodeModal.tsx - VerificationCode

import React, { useRef} from "react";
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
      <div className="w-[28rem] bg-white rounded-lg shadow-lg p-10">
        <h2 className="text-2xl font-semibold text-center text-[#262220] mb-8">
          輸入驗證碼
        </h2>
        <input
          ref={codeRef}
          type="text"
          placeholder="輸入驗證碼"
          className="w-full px-5 py-3 border border-[#C3A6A0] rounded-md text-base focus:outline-none focus:ring-2 focus:ring-[#A15C38]"
        />
        <div className="mt-8 flex justify-between">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-[#262220] font-medium rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-3 bg-[#A15C38] hover:bg-[#262220] text-white font-medium rounded-lg transition-colors"
          >
            確認
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationCodeModal