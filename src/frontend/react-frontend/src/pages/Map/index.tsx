// src/pages/Map.tsx - Updated to include a context menu with "新增白板" option

import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WhiteboardData } from '@/interfaces/Whiteboard/WhiteboardData';
import { WhiteboardUpdateData } from '@/interfaces/Whiteboard/WhiteboardUpdateData';
import { CreateWhiteboardData } from '@/interfaces/Whiteboard/CreateWhiteboardData';
import { UserData } from '@/interfaces/User/UserData';
import { UserUpdateData } from '@/interfaces/User/UserUpdateData';
import { updateUser } from '@/services/userService';
import { getUserFromToken } from '@/services/loginService';
import { createWhiteboard, deleteWhiteboardById, updateWhiteboard } from '@/services/whiteboardService';
import Sidebar from '@/components/common/sidebar';
import { Rnd } from 'react-rnd';

const Map: React.FC = () => {
    const navigate = useNavigate();
    const { userName } = useParams<{ userName: string }>();
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);
    const [whiteboards, setWhiteboards] = useState<WhiteboardData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
    const [isAdding, setIsAdding] = useState<boolean>(false); // Track if adding a whiteboard
    const [newWhiteboardTitle, setNewWhiteboardTitle] = useState<string>('');
    const [newWhiteboardPrivate, setNewWhiteboardPrivate] = useState<boolean>(false);
    const [draggingWhiteboardId, setDraggingWhiteboardId] = useState<string | null>(null); // Track which whiteboard is being dragged
    const [zoomLevel, setZoomLevel] = useState<number>(1); // State for zoom level
    const whiteboardRef = useRef<HTMLDivElement>(null);

    // Fetch current user data when the component mounts
    useEffect(() => {
      const fetchCurrentUser = async () => {
          try {
              const user = await getUserFromToken();
              setCurrentUser(user);
              setLoading(false);
          } catch (error) {
              console.error('Failed to fetch current user:', error);
              setError('Failed to fetch current user.');
              setLoading(false);
              navigate('/auth/login'); 
          }
      };

      fetchCurrentUser();
  }, [navigate]);

    // Fetch whiteboards data from the backend when the component mounts
    useEffect(() => {
      const fetchWhiteboardsData = async () => {
          if (!currentUser) return;
          try {
              const data = currentUser.whiteboards as WhiteboardData[];
              const validatedData = data.map(wb => ({
                  ...wb,
                  position: wb.position || { x: 0, y: 0 },
                  dimensions: wb.dimensions || { width: 200, height: 150 },
              }));
              setWhiteboards(validatedData);
              setLoading(false);
          } catch (err: any) {
              console.error('Failed to fetch whiteboards:', err);
              setError(err.message || 'Failed to fetch whiteboards');
              setLoading(false);
          }
      };

        fetchWhiteboardsData();
    }, [currentUser]);

    // Handle creating a new whiteboard
    const handleCreateWhiteboard = async (e: FormEvent) => {
        e.preventDefault();
    
        if (newWhiteboardTitle.trim() === '') {
            alert('白板標題不可以是空白');
            return;
        }

        if (newWhiteboardTitle.length > 20) {
          alert('白板標題長度不可以超過20個字元');
          return;
      }
    
        if (!currentUser) {
            alert('User data is not available.');
            return;
        }

        // Ensure contextMenu is not null
        if (!contextMenu) {
            alert('Context menu position is not available.');
            return;
        }

        const whiteboardData: CreateWhiteboardData = {
            whiteboardTitle: newWhiteboardTitle,
            isPrivate: newWhiteboardPrivate,
            userId: currentUser._id,
            position: { x: contextMenu.x, y: contextMenu.y }, // Use the context menu position
            dimensions: { width: 200, height: 150 },
            cards: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    
        try {
            // Create the whiteboard and update state
            const createdWhiteboard = await createWhiteboard(whiteboardData);
            const updatedWhiteboards = [...whiteboards, createdWhiteboard];
            setWhiteboards(updatedWhiteboards);
            setNewWhiteboardTitle('');
            setNewWhiteboardPrivate(false);
            setContextMenu(null);
            setIsAdding(false);

            const updatedUser: Partial<UserUpdateData> = {
                whiteboards: updatedWhiteboards,
            };
            
            try {
                await updateUser(currentUser._id, updatedUser);
                setCurrentUser({
                    ...currentUser,
                    whiteboards: updatedWhiteboards,
                });
            } catch (err: any) {
                console.error('Failed to create whiteboard:', err);
                alert(err.message || 'Failed to create whiteboard');
            }
        } catch (err: any) {
            console.error('Failed to create whiteboard:', err);
            alert(err.message || 'Failed to create whiteboard');
        }

    };

    // Handle deleting a whiteboard
    const handleDeleteWhiteboard = async (id: string) => {
        if (window.confirm('你確定要刪除這個白板嗎?')) {
            try {
                await deleteWhiteboardById(id);
                // Update state to remove the deleted whiteboard
                const updatedWhiteboards = whiteboards.filter((wb) => wb._id !== id);
                setWhiteboards(updatedWhiteboards);
                
                const updatedUser: Partial<UserUpdateData> = {
                    whiteboards: updatedWhiteboards,
                };
        
                try {
                    await updateUser(currentUser!._id, updatedUser);
                    setCurrentUser({
                        ...currentUser!,
                        whiteboards: updatedWhiteboards,
                    });
                } catch (err: any) {
                    console.error('Failed to delete whiteboard:', err);
                    alert(err.message || 'Failed to delete whiteboard');
                }
            } catch (err: any) {
                console.error('Failed to delete whiteboard:', err);
                alert(err.message || 'Failed to delete whiteboard');
            }

        }
    };

    // Handle right-click to show context menu
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        // Prevent context menu from appearing near the top-left corner (where the toggle button is)
        const padding = 50; // Adjust as needed
        const x = e.clientX < padding ? padding : e.clientX;
        const y = e.clientY < padding ? padding : e.clientY;
        setContextMenu({ x, y });
        setIsAdding(false); // Reset adding form if context menu is reopened
    };

    // Handle click outside the context menu to close it
    useEffect(() => {
        const handleClick = () => {
            if (contextMenu) {
                setContextMenu(null);
                setIsAdding(false);
            }
        };

        window.addEventListener('click', handleClick);
        return () => {
            window.removeEventListener('click', handleClick);
        };
    }, [contextMenu]);

    // Handle dragging of a whiteboard
    const handleDrag = (currentWb: WhiteboardData, d: { x: number; y: number }) => {
        const adjustedX = d.x / zoomLevel; 
        const adjustedY = d.y / zoomLevel; 

        // Update position of the whiteboard being dragged
        const updatedWhiteboards = whiteboards.map(wb => {
            if (wb._id === currentWb._id) {
                return {
                    ...wb,
                    position: { x: adjustedX, y: adjustedY },
                };
            }
            return wb;
        });

        setWhiteboards(updatedWhiteboards);
    };
    
    // Handle drag stop to update the whiteboard position in the backend
    const handleDragStop = async (id: string, d: { x: number; y: number }) => {
        const adjustedX = d.x / zoomLevel; 
        const adjustedY = d.y / zoomLevel; 

        try {
            const whiteboardIndex = whiteboards.findIndex(wb => wb._id === id);
            if (whiteboardIndex === -1) return;

            const updatedWhiteboards = [...whiteboards];
            updatedWhiteboards[whiteboardIndex] = {
                ...updatedWhiteboards[whiteboardIndex],
                position: { x: adjustedX, y: adjustedY },
                updatedAt: new Date(),
            };

            setWhiteboards(updatedWhiteboards);

            const updateData: Partial<WhiteboardUpdateData> = {
                position: { x: adjustedX, y: adjustedY },
                updatedAt: new Date(),
            };

            await updateWhiteboard(id, updateData);
        } catch (err: any) {
            console.error('Failed to update whiteboard position:', err);
            alert(err.message || 'Failed to update whiteboard position');
        } finally {
            setDraggingWhiteboardId(null);
        }
    };

    // Function to handle zoom in
    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 0.2, 1.25)); 
    };

    // Function to handle zoom out
    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 0.2, 0.75)); 
    };

    // Function to handle reset zoom
    const handleResetZoom = () => {
        setZoomLevel(1);
    };


    // Display a loading message while data is being fetched
    if (loading) {
        return <div className="p-5 text-center">正在載入使用者的資料</div>;
    }
    // Display an error message if fetching data fails
    if (error) {
        return <div className="p-5 text-center text-red-500">{error}</div>;
    }

  return (
    <div className="relative w-full h-screen bg-[#F7F1F0]" onContextMenu={handleContextMenu}>
      {/* Render the sidebar and pass currentUser and setCurrentUser as props */}
      <Sidebar currentUser={currentUser} setCurrentUser={setCurrentUser} />

      {/* Main content without margin, whiteboard occupies full screen */}
      <div className="absolute top-0 left-0 w-full h-full">
        <h2 className="text-4xl font-serif font-extrabold text-center text-[#262220] py-5 tracking-wide">
          地圖
        </h2>

        {/* Zoom Controls fixed at bottom right */}
        <div className="fixed bottom-10 right-10 z-10 flex flex-col space-y-2">
          <button
            onClick={handleZoomIn}
            className="px-3 py-2 bg-[#A15C38] text-white rounded hover:bg-[#8B4F2F] transition"
            title="放大"
          >
            放大
          </button>
          <button
            onClick={handleZoomOut}
            className="px-3 py-2 bg-[#A15C38] text-white rounded hover:bg-[#8B4F2F] transition"
            title="縮小"
          >
            縮小
          </button>
          <button
            onClick={handleResetZoom}
            className="px-3 py-2 bg-[#A15C38] text-white rounded hover:bg-[#8B4F2F] transition"
            title="重置縮放"
          >
            重置
          </button>
        </div>

                {/* Whiteboard container with zoom applied */}
                <div
                    className="overflow-auto bg-[#C3A6A0] relative w-full h-full"
                    style={{ 
                        width: '10000px', 
                        height: '10000px',
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: '0 0',
                    }}
                    ref={whiteboardRef}
                >
                    {/* Render whiteboards */}
                    {whiteboards.map((whiteboard) => (
                        <Rnd
                            key={whiteboard._id}
                            size={{ width: whiteboard.dimensions.width, height: whiteboard.dimensions.height }}
                            position={{
                                x: whiteboard.position.x * zoomLevel,
                                y: whiteboard.position.y * zoomLevel,
                            }}
                            onDragStart={() => { setDraggingWhiteboardId(whiteboard._id); }}
                            onDrag={(e, d) => { 
                                handleDrag(whiteboard, d); // Update position during dragging
                            }}
                            onDragStop={(e, d) => { 
                                handleDragStop(whiteboard._id, d); 
                            }}
                            bounds="parent"
                            dragHandleClassName="drag-handle"
                            enableResizing={false} 
                        >
                            <div
                                className="relative bg-white border border-[#C3A6A0] shadow-xl rounded-2xl p-6 cursor-pointer transform transition-transform duration-300 hover:scale-110 hover:shadow-2xl"
                                onClick={() => {
                                    if (!draggingWhiteboardId) {
                                        navigate(`/whiteboard/${whiteboard._id}`);
                                    }
                                }}
                            >
                                {/* Delete Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (whiteboard._id) handleDeleteWhiteboard(whiteboard._id);
                                    }}
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-lg"
                                    title="Delete Whiteboard"
                                >
                                    🗑️
                                </button>

                {/* Whiteboard Title */}
                <h3 className="text-2xl font-serif font-bold text-[#262220] drag-handle">
                  {whiteboard.whiteboardTitle}
                </h3>

                {/* Card Count */}
                <p className="text-lg text-[#A15C38] mt-3">
                  卡片數量: {whiteboard.cards?.length || 0}
                </p>
              </div>
            </Rnd>
          ))}
        </div>
      </div>

      {/* Context Menu for Adding Whiteboard */}
      {contextMenu && !isAdding && (
        <div
          className="absolute bg-white border border-[#C3A6A0] shadow-lg rounded-lg p-2"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 800, // Lower z-index than the toggle button
            transform: 'translate(-50%, -50%)', // Center the context menu
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setIsAdding(true)}
            className="w-full text-left px-4 py-2 hover:bg-[#F0E6E0] rounded"
          >
            新增白板
          </button>
        </div>
      )}

      {/* Form to Add Whiteboard */}
      {contextMenu && isAdding && (
        <div
          className="absolute bg-white border border-[#C3A6A0] shadow-lg rounded-lg p-6"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 800, // Lower z-index than the toggle button
            transform: 'translate(-50%, -50%)', // Center the form
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleCreateWhiteboard} className="space-y-4">
            <h3 className="text-xl font-semibold text-[#262220]">新增白板</h3>
            <div>
              <label className="block mb-2 text-sm font-medium text-[#262220]">
                標題
              </label>
              <input
                type="text"
                value={newWhiteboardTitle}
                onChange={(e) => {
                  if (e.target.value.length <= 20) {
                      setNewWhiteboardTitle(e.target.value);
                  } else {
                      alert('白板標題長度必須小於 20 個字元');
                  }
              }}
                className="w-full px-4 py-2 border border-[#C3A6A0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A15C38]"
                placeholder="輸入白板標題"
                required
              />
              <p className="text-xs text-red-500 mt-1">
                    {newWhiteboardTitle.length > 20 && '標題不得超過20字元'}
              </p>
              
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => { setContextMenu(null); setIsAdding(false); }}
                className="px-4 py-2 bg-[#A15C38] text-white rounded-lg shadow-xl hover:shadow-2xl transition-transform duration-300 hover:scale-110"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#A15C38] text-white rounded-lg shadow-xl hover:shadow-2xl transition-transform duration-300 hover:scale-110"
              >
                建立
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Map;
