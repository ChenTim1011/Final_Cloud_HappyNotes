// components/common/sidebar.tsx
import React, { useState } from 'react';
import { FaBars } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { updateUser } from '@/services/userService';
import { UserUpdateData } from '@/interfaces/User/UserUpdateData';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'react-toastify';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useUser();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const logout = async() => {
    if (!currentUser) return;

    const updateduser: UserUpdateData = {
      userName: currentUser.userName,
      userPassword: currentUser.userPassword,
      email: currentUser.email,
      isLoggedin: false,
      whiteboards: currentUser.whiteboards,
    };
    

    try {
      await updateUser(currentUser._id, updateduser);
      setCurrentUser(null);
      toast.success('登出成功！');
      navigate('/auth/login');
    } catch (err: any) {
      console.error('Failed to log out:', err);
      toast.error('登出失敗，請稍後再試');
    }
  };

  // Show a simple sidebar with a hamburger menu button if the user is not logged in
  if (!currentUser) {
    return (
      <div>
        <div className="relative">
          <button
            type="button"
            title="Toggle Sidebar"
            onClick={() => navigate('/auth/login')}
            className="p-2 absolute top-0 left-0 z-50 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
          >
            <FaBars size={24} />
          </button>
        </div>
      </div>
    );
  }

  // Show the sidebar with user information and navigation options if the user is logged in
  return (
    <div>
      {/* Sidebar container */}
      <div className="relative">
        {/* Sidebar toggle button */}
        <button
          type="button"
          title="Toggle Sidebar"
          onClick={toggleSidebar}
          className="p-2 absolute top-0 left-0 z-50 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
        >
          <FaBars size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-gray-800 text-white transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: '250px', zIndex: 40 }}
      >
        <div className="p-4">
          <div className="flex flex-col space-y-4">
            {/* User Information */}
            <div className="mt-10 p-4 bg-gray-700 rounded-md">
              <p className="text-sm text-gray-300">使用者</p>
              <p className="font-medium">{currentUser.userName}</p>
            </div>

    
            <a
              className="p-2 bg-gray-700 rounded-md text-center hover:bg-gray-600 cursor-pointer transition-colors duration-200"
              onClick={() => {
                setIsOpen(false);
                navigate(`/map/${currentUser.userName}`);
              }}
            >
              地圖
            </a>

            <a
              className="p-2 bg-gray-700 rounded-md text-center hover:bg-gray-600 cursor-pointer transition-colors duration-200"
              onClick={() => {
                setIsOpen(false);
                navigate(`/management/${currentUser.userName}`);
              }}
            >
              管理卡片
            </a>
            {/* Link to Log Out */}
            <a
              className="p-2 bg-red-700 rounded-md text-center hover:bg-red-600 cursor-pointer transition-colors duration-200"
              onClick={async () => {
                setIsOpen(false);
                await logout();
              }}
            >
              登出
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
