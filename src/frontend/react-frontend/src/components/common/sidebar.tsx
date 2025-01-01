// components/common/sidebar.tsx
import React, { useState } from 'react';
import { FaBars } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { updateUser } from '@/services/userService';
import { UserUpdateData } from '@/interfaces/User/UserUpdateData';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'react-toastify';

interface SidebarProps {
  isSidebarOpen: boolean; // 新增 isSidebarOpen prop
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen }) => {
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

      </div>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-[#F7F1F0] text-[#262220] transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: "300px", zIndex: 40 }}
      >
        <div className="p-6">
          <div className="flex flex-col space-y-6">
            {/* User Information */}
            <div className="mt-20 p-6 bg-[#3E2C29] text-center rounded shadow-lg">
              <p className="text-lg text-gray-300">使用者</p>
              <p className="font-bold text-lg text-white">{currentUser.userName}</p>
            </div>

    
            <a
              className="py-3 px-4 bg-[#A15C38] text-center text-white font-medium rounded hover:bg-[#8B4C34] transition-colors duration-200 shadow-md"
              onClick={() => {
                setIsOpen(false);
                navigate(`/map/${currentUser.userName}`);
              }}
            >
              地圖
            </a>

            <a
              className="py-3 px-4 bg-[#A15C38] text-center text-white font-medium rounded hover:bg-[#8B4C34] transition-colors duration-200 shadow-md"
              onClick={() => {
                setIsOpen(false);
                navigate(`/management/${currentUser.userName}`);
              }}
            >
              管理卡片
            </a>
  
            {/* Logout Button */}
            <a
              className="py-3 px-4 bg-[#D64545] text-center text-white font-medium rounded hover:bg-[#B53838] transition-colors duration-200 shadow-md"
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
