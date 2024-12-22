// Home.tsx - Displays the home page, which includes a title and a navigation button

import React from 'react';
import { useNavigate } from 'react-router-dom';

// Home.tsx - Displays the home page, which includes a title and a navigation button

const Home: React.FC = () => {
  // Use the useNavigate hook to handle page navigation
  const navigate = useNavigate();

  return (
    // Set the container to be vertically centered and fill the entire screen
    <div className="flex flex-col items-center justify-center h-screen bg-white">
    
      {/* Title with large font size and black text */}
      <h1 className="text-[15vh] text-black m-0">HappyNote</h1>

      {/* Button to login when clicked */}
      <button
        className="mt-14 px-5 py-2 text-xl cursor-pointer bg-black text-white border-none rounded transition-colors duration-300 hover:bg-blueviolet"
        onClick={() => navigate('/auth/login')}
      >
        登入
      </button>
    </div>
  );
};

export default Home;
