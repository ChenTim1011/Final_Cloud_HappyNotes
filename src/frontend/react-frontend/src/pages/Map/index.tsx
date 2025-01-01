// src/pages/Map.tsx - Updated to include a context menu with "新增白板" option

import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WhiteboardData } from '@/interfaces/Whiteboard/WhiteboardData';
import { WhiteboardUpdateData } from '@/interfaces/Whiteboard/WhiteboardUpdateData';
import { CreateWhiteboardData } from '@/interfaces/Whiteboard/CreateWhiteboardData';
import { UserData } from '@/interfaces/User/UserData';
import { UserUpdateData } from '@/interfaces/User/UserUpdateData';
import { getUserByName, updateUser } from '@/services/userService';
import { createWhiteboard, deleteWhiteboardById, updateWhiteboard } from '@/services/whiteboardService';
import Sidebar from '@/components/common/sidebar';
import { Rnd } from 'react-rnd';

interface AlignmentLine {
  orientation: 'horizontal' | 'vertical';
  position: number;
}

const Map: React.FC = () => {
    const navigate = useNavigate();
    const { userName } = useParams<{ userName: string }>();
    const [users, setUsers] = useState<UserData[]>([]);
    const [whiteboards, setWhiteboards] = useState<WhiteboardData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
    const [isAdding, setIsAdding] = useState<boolean>(false); // Track if adding a whiteboard
    const [newWhiteboardTitle, setNewWhiteboardTitle] = useState<string>('');
    const [newWhiteboardPrivate, setNewWhiteboardPrivate] = useState<boolean>(false);
    const [draggingWhiteboardId, setDraggingWhiteboardId] = useState<string | null>(null); // Track which whiteboard is being dragged
    const [alignmentLines, setAlignmentLines] = useState<AlignmentLine[]>([]); // State to hold alignment lines
    const [zoomLevel, setZoomLevel] = useState<number>(1); // State for zoom level
    const whiteboardRef = useRef<HTMLDivElement>(null);

    // Fetch whiteboards data from the backend when the component mounts
    useEffect(() => {
        const fetchWhiteboardsData = async () => {
            try {
                const users = await getUserByName(userName);
                setUsers(users);
                const data = users[0].whiteboards as WhiteboardData[];

                // Validate the data
                const validatedData = data.map(wb => {
                    if (!wb._id) {
                        throw new Error('Whiteboard data does not have an ID');
                    }
                    // Ensure position and dimensions are present
                    return {
                        ...wb,
                        position: wb.position || { x: 0, y: 0 },
                        dimensions: wb.dimensions || { width: 200, height: 150 },
                    };
                });
                setWhiteboards(validatedData);
                setLoading(false);
            } catch (err: any) {
                console.error('Failed to fetch whiteboards:', err);
                setError(err.message || 'Failed to fetch whiteboards');
                setLoading(false);
            }
        };
                
        fetchWhiteboardsData();
    }, [userName]); 

    // Handle creating a new whiteboard
    const handleCreateWhiteboard = async (e: FormEvent) => {
        e.preventDefault();
    
        if (newWhiteboardTitle.trim() === '') {
            alert('Whiteboard title is required.');
            return;
        }
    
      
        if (users.length === 0) {
            alert('User data is not available.');
            return;
        }

        const userId = users[0]._id;

        // Ensure contextMenu is not null
        if (!contextMenu) {
            alert('Context menu position is not available.');
            return;
        }

        const whiteboardData: CreateWhiteboardData = {
            whiteboardTitle: newWhiteboardTitle,
            isPrivate: newWhiteboardPrivate,
            userId: userId,
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

            const updatedUser: UserUpdateData = {
                whiteboards: updatedWhiteboards,
            };
            
            try {
                await updateUser(users[0]._id, updatedUser);
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
                
                const updatedUser: UserUpdateData = {
                    whiteboards: updatedWhiteboards,
                };
        
                try {
                    await updateUser(users[0]._id, updatedUser);
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



    const handleDrag = (currentWb: WhiteboardData, d: { x: number; y: number }) => {
      const adjustedX = d.x / zoomLevel; 
      const adjustedY = d.y / zoomLevel; 
  
      const newAlignmentLines: AlignmentLine[] = [];
      const currentEdges = {
          left: adjustedX,
          right: adjustedX + currentWb.dimensions.width,
          top: adjustedY,
          bottom: adjustedY + currentWb.dimensions.height,
          centerX: adjustedX + currentWb.dimensions.width / 2,
          centerY: adjustedY + currentWb.dimensions.height / 2,
      };
  
      whiteboards.forEach(wb => {
          if (wb._id === currentWb._id) return;
  
          const edges = {
              left: wb.position.x,
              right: wb.position.x + wb.dimensions.width,
              top: wb.position.y,
              bottom: wb.position.y + wb.dimensions.height,
              centerX: wb.position.x + wb.dimensions.width / 2,
              centerY: wb.position.y + wb.dimensions.height / 2,
          };
  
          const tolerance = 10; 
  
          if (Math.abs(currentEdges.left - edges.left) < tolerance) {
              newAlignmentLines.push({ orientation: 'vertical', position: edges.left });
          }
          if (Math.abs(currentEdges.right - edges.right) < tolerance) {
              newAlignmentLines.push({ orientation: 'vertical', position: edges.right });
          }
          if (Math.abs(currentEdges.centerX - edges.centerX) < tolerance) {
              newAlignmentLines.push({ orientation: 'vertical', position: edges.centerX });
          }
  
          if (Math.abs(currentEdges.top - edges.top) < tolerance) {
              newAlignmentLines.push({ orientation: 'horizontal', position: edges.top });
          }
          if (Math.abs(currentEdges.bottom - edges.bottom) < tolerance) {
              newAlignmentLines.push({ orientation: 'horizontal', position: edges.bottom });
          }
          if (Math.abs(currentEdges.centerY - edges.centerY) < tolerance) {
              newAlignmentLines.push({ orientation: 'horizontal', position: edges.centerY });
          }
      });
  
      setAlignmentLines(newAlignmentLines);
  };
  
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
          setAlignmentLines([]);
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
      {/* Render the sidebar */}
      <Sidebar />

      {/* Main content without margin, whiteboard occupies full screen */}
      <div className="absolute top-0 left-0 w-full h-full">
        <h2 className="text-4xl font-serif font-extrabold text-center text-[#262220] py-5 tracking-wide">
          地圖
        </h2>

        {/* Zoom Controls fixed at bottom right */}
        <div className="fixed bottom-10 right-10 z-10 flex flex-col space-y-2">
          <button
            onClick={handleZoomIn}
            className="px-3 py-2 bg-[#A15C38] text-white rounded shadow hover:bg-[#8B4F2F] transition"
            title="放大"
          >
            放大
          </button>
          <button
            onClick={handleZoomOut}
            className="px-3 py-2 bg-[#A15C38] text-white rounded shadow hover:bg-[#8B4F2F] transition"
            title="縮小"
          >
            縮小
          </button>
          <button
            onClick={handleResetZoom}
            className="px-3 py-2 bg-[#A15C38] text-white rounded shadow hover:bg-[#8B4F2F] transition"
            title="重置縮放"
          >
            重置
          </button>
        </div>

        {/* Whiteboard container with zoom applied */}
        <div
          className="overflow-auto bg-[#C3A6A0] relative w-full h-full"
          style={{ 
            width: '2000px', 
            height: '2000px',
            transform: `scale(${zoomLevel})`,
            transformOrigin: '0 0',
          }}
          ref={whiteboardRef}
        >
          {/* Render alignment lines */}
          {alignmentLines.map((line, index) => (
            <div
              key={index}
              className={`absolute bg-blue-500`}
              style={
                line.orientation === 'vertical'
                  ? { left: line.position, top: 0, bottom: 0, width: 1 }
                  : { top: line.position, left: 0, right: 0, height: 1 }
              }
            />
          ))}

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
                handleDrag(whiteboard, d); // Calculate alignment during dragging
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
                onChange={(e) => setNewWhiteboardTitle(e.target.value)}
                className="w-full px-4 py-2 border border-[#C3A6A0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A15C38]"
                placeholder="輸入白板標題"
                required
              />
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
