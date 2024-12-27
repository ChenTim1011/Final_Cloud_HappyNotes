// Home.tsx - Displays the home page, which includes a title and a navigation button

import React from 'react';
import { useNavigate } from 'react-router-dom';

// Home.tsx - Displays the home page, which includes a title and a navigation button

const Home: React.FC = () => {
  // Use the useNavigate hook to handle page navigation
  const navigate = useNavigate();

  return (
    <div
      className="relative flex flex-col items-center justify-center h-screen bg-radial-gradient overflow-hidden"
    >
      {/* Title with large font size and black text */}
      <h1 className="text-[15vh] text-[#262220] font-serif">
        HappyNote
      </h1>

      
      <p className="text-2xl text-[#262220] font-semibold mt-6 shadow-md">
        讓 <span className="text-[#A15C38]">HappyNote</span> 成為你最好的學習夥伴
      </p>

      {/* Button to login when clicked */}
      <button
        className="mt-14 px-8 py-3 text-xl cursor-pointer bg-[#A15C38] text-white border-none rounded-full shadow-xl hover:shadow-2xl transition-transform duration-300 hover:scale-110"
        onClick={() => navigate('/auth/login')}
      >
        登入
      </button>

      {/* Footer with small font size and gray text */}
      <p className="absolute bottom-5 text-sm text-[#262220] opacity-70">
        © 2024 HappyNote. All Rights Reserved.
      </p>
    </div>
  );
};

export default Home;
