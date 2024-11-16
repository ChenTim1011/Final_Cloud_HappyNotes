import React, { useRef, useState } from "react";
import fullscreenPic from '@/assets/fullscreenPic.png';
import exitFullscreenPic from '@/assets/exitFullscreenPic.png';


type FullscreenToggleProps = {
  targetId: string; // 白板的 ID，用於全螢幕切換
};

const FullscreenToggle: React.FC<FullscreenToggleProps> = ({ targetId }) => {
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);

  const toggleFullscreen = () => {
    const element = document.getElementById(targetId);
    if (!element) return;

    if (!isFullscreenMode) {
      // 進入全螢幕
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen();
      }
      setIsFullscreenMode(true);
    } else {
      // 退出全螢幕
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
      setIsFullscreenMode(false);
    }
  };

  return (
    <button
      onClick={toggleFullscreen}
      className="absolute bottom-2 right-2 p-2 bg-transparent rounded-sm shadow-md hover:bg-gray-300"
    >
      {/* Toggle between 1.png and 2.png based on fullscreen state */}
      <img
        src={isFullscreenMode ? fullscreenPic : exitFullscreenPic}
        alt="Fullscreen Toggle"
        className="w-8 h-8"
      />
    </button>
  );
};

export default FullscreenToggle;
