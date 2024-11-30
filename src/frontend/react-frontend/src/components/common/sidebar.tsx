import React, { useState } from 'react';
import { FaBars } from 'react-icons/fa';  // Using Font Awesome for the toggle icon

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

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
              href="http://localhost:5173/"
              className="mt-10 p-2 bg-gray-700 rounded-md text-center hover:bg-gray-600"
              onClick={() => setIsOpen(false)}  // Close the sidebar when clicked
            >
              回到首頁
            </a>

            {/* Link to Map Page */}
            <a
              href="http://localhost:5173/map"
              className="p-2 bg-gray-700 rounded-md text-center hover:bg-gray-600"
              onClick={() => setIsOpen(false)}  // Close the sidebar when clicked
            >
              地圖
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
