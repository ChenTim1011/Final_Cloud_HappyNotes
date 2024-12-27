import React, { useEffect, useState } from 'react';
import { FaBars } from 'react-icons/fa';  // Using Font Awesome for the toggle icon
import { useNavigate } from "react-router-dom";
import { getUserByName, updateUser} from '@/services/userService';
import { UserData } from '@/interfaces/User/UserData';
import { UserUpdateData } from '@/interfaces/User/UserUpdateData';

interface SidebarProps{
   users: UserData[];
}

const Sidebar: React.FC<SidebarProps> = ({users}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData>(users[0]);

  // Use the useNavigate hook to handle page navigation
  const navigate = useNavigate();



  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const logout = async() =>{
    setCurrentUser(users[0]);
    const updateduser: UserUpdateData = {
        isLoggedin: false,
    };
    

    try {
        await updateUser(currentUser._id,updateduser);
    } catch (err: any) {
        console.error('Failed to log out:', err);
        alert(err.message || 'Failed to log out');
    }
  }

  return (
    <div>
      {/* Sidebar container */}
      <div className="relative">
        {/* Sidebar toggle button */}
        <button
          type="button"
          title="Toggle Sidebar"
          onClick={toggleSidebar}
          className="p-2 absolute top-0 left-0 z-50 bg-gray-800 text-white rounded-md"
        >
          <FaBars size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-gray-800 text-white transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: '250px', zIndex: 40 }}
      >
        <div className="p-4">
          <div className="flex flex-col space-y-4">
            {/* Link to Homepage */}
            <a
              className="mt-10 p-2 bg-gray-700 rounded-md text-center hover:bg-gray-600"
              onClick={() => { 
                setIsOpen(false); 
                logout(); 
                navigate(`../..`);
              }}  // Close the sidebar when clicked
            >
              回到首頁
            </a>

            {/* Link to Map Page */}
            <a
              className="p-2 bg-gray-700 rounded-md text-center hover:bg-gray-600"
              onClick={() => { 
                setIsOpen(false); 
                navigate(`../../map/${currentUser.userName}`);
              }}  // Close the sidebar when clicked
            >
              地圖
            </a>
            {/* Link to Log Out */}
            <a
              className="p-2 bg-red-700 rounded-md text-center hover:bg-red-600"
              onClick={() => { 
                setIsOpen(false);
                logout(); 
                navigate(`../../auth/login`);
              }}  // Close the sidebar and log out when clicked
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
