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
        <div className="p-4">This is the sidebar content</div>
      </div>

    </div>
  );
};

export default Sidebar;
