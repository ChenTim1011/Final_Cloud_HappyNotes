import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);

  const toggleVideo = () => {
    setShowVideo(!showVideo);
  };

  return (
    <div
      className="relative flex flex-col items-center justify-start min-h-screen bg-radial-gradient overflow-auto"
    >
      <div className="mt-40 text-center">
        


        <h1 className="text-[15vh] text-[#262220] font-serif">
          HappyNote
        </h1>

        
        <p className="text-2xl text-[#262220] font-semibold mt-6 shadow-md">
          讓 <span className="text-[#A15C38]">HappyNote</span> 成為你學習最好的夥伴
        </p>

      
        <button
          className="mt-14 px-8 py-3 text-xl cursor-pointer bg-[#A15C38] text-white border-none rounded-full shadow-xl hover:shadow-2xl transition-transform duration-300 hover:scale-110"
          onClick={() => navigate('/auth/login')}
        >
          登入
        </button>

        
        <button
          className="ml-5 mt-6 px-8 py-3 text-xl cursor-pointer bg-[#A15C38] text-white border-none rounded-full shadow-xl hover:shadow-2xl transition-transform duration-300 hover:scale-110"
          onClick={toggleVideo}
        >
          使用指南
        </button>
      </div>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-2xl w-full">
            <div className="flex justify-end">
              <button
                className="text-black text-lg font-bold hover:text-gray-500"
                onClick={toggleVideo}
              >
                ×
              </button>
            </div>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Cpoyright */}
      <div className="mt-auto mb-5 flex items-center space-x-6 text-sm text-[#262220] opacity-70">
        <span className="text-[#262220]">© 2025 HappyNote</span>
        <a
          href="https://github.com/ChenTim1011/HappyNotes"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-100"
        >
          <img
            src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
            alt="GitHub"
            className="w-6 h-6 rounded-full"
          />
        </a>
        <a
          href="mailto:110208059@g.nccu.edu.tw"
          className="hover:opacity-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            strokeWidth="2"
            viewBox="0 0 20 20"
            className="w-6 h-6 stroke-[#6a6972] group-hover:stroke-active shrink-0"
          >
            <path d="M3.335 3.333h13.333c.917 0 1.667.75 1.667 1.667v10c0 .917-.75 1.667-1.667 1.667H3.335c-.917 0-1.667-.75-1.667-1.667V5c0-.917.75-1.667 1.667-1.667Z"></path>
            <path d="M18.335 5 10 10.833 1.668 5"></path>
          </svg>
        </a>
      </div>
    </div>
  );
};

export default Home;
