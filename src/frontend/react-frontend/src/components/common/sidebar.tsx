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

  const logout = async() =>{
    setCurrentUser(null);
    const updatedUser: UserUpdateData = {
        isLoggedin: false,
    };
    

    try {
        if (currentUser) {
          await updateUser(currentUser._id, updatedUser);
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
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
            className="p-2 absolute top-0 left-0 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
            style={{ zIndex: 1000 }} // Ensure the button is on top
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
      {/* Sidebar toggle button */}
      <button
        type="button"
        title="Toggle Sidebar"
        onClick={toggleSidebar}
        className=" p-3 fixed top-4 left-4 bg-[#A15C38] text-white rounded hover:bg-[#8B4C34] transition-colors duration-200"
        style={{ zIndex: 1000 }} // Higher z-index to stay above other elements
      >
        <FaBars size={24} />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-[#F7F1F0] text-[#262220] transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "300px", zIndex: 900 }} // Lower z-index than the toggle button
      >
        <div className="p-6">
          <div className="flex flex-col space-y-6">
            {/* User Information */}
            <div className="mt-20 p-6 bg-[#3E2C29] text-center rounded shadow-lg">
              <p className="text-lg text-gray-300">使用者</p>
              <p className="font-bold text-lg text-white">{currentUser.userName}</p>
            </div>

    
            <a
              className="py-3 px-4 bg-[#A15C38] text-center text-white font-medium rounded hover:bg-[#8B4C34] transition-colors duration-200 shadow-md cursor-pointer"
              onClick={() => {
                setIsOpen(false);
                navigate(`/map/${currentUser.userName}`);
              }}
            >
              地圖
            </a>

            <a
              className="py-3 px-4 bg-[#A15C38] text-center text-white font-medium rounded hover:bg-[#8B4C34] transition-colors duration-200 shadow-md cursor-pointer"
              onClick={() => {
                setIsOpen(false);
                navigate(`/management/${currentUser.userName}`);
              }}
            >
              管理卡片
            </a>
  
            {/* Logout Button */}
            <a
              className="py-3 px-4 bg-[#D64545] text-center text-white font-medium rounded hover:bg-[#B53838] transition-colors duration-200 shadow-md cursor-pointer"
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
