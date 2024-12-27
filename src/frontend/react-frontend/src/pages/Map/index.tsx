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

const Map: React.FC = () => {
    const navigate = useNavigate();
    const { userName } = useParams<{ userName: string }>();
    const [users, setUsers] = useState<UserData[]>([]);
    const [whiteboards, setWhiteboards] = useState<WhiteboardData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
    const [isAdding, setIsAdding] = useState<boolean>(false); // New state to track if adding
    const [newWhiteboardTitle, setNewWhiteboardTitle] = useState<string>('');
    const [newWhiteboardPrivate, setNewWhiteboardPrivate] = useState<boolean>(false);
    const draggedRef = useRef<boolean>(false); 

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

            // Update user whiteboards
            const updatedUser: UserUpdateData = {
                userName: users[0].userName,
                userPassword: users[0].userPassword,
                email: users[0].email,
                isLoggedin: users[0].isLoggedin,
                whiteboards: updatedWhiteboards.map(wb => wb._id), 
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
        if (window.confirm('Are you sure you want to delete this whiteboard?')) {
            try {
                await deleteWhiteboardById(id);
                // Update state to remove the deleted whiteboard
                const updatedWhiteboards = whiteboards.filter((wb) => wb._id !== id);
                setWhiteboards(updatedWhiteboards);
                
                const updatedUser: UserUpdateData = {
                    userName: users[0].userName,
                    userPassword: users[0].userPassword,
                    email: users[0].email,
                    isLoggedin: users[0].isLoggedin,
                    whiteboards: updatedWhiteboards.map(wb => wb._id), 
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
        setContextMenu({ x: e.clientX, y: e.clientY });
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

    // Handle drag stop to update whiteboard position
    const handleDragStop = async (id: string, d: { x: number; y: number }) => {
        try {
            // Find the whiteboard to update
            const whiteboardIndex = whiteboards.findIndex(wb => wb._id === id);
            if (whiteboardIndex === -1) return;

            const updatedWhiteboards = [...whiteboards];
            updatedWhiteboards[whiteboardIndex] = {
                ...updatedWhiteboards[whiteboardIndex],
                position: { x: d.x, y: d.y },
                updatedAt: new Date(),
            };

            setWhiteboards(updatedWhiteboards);

            // Update the whiteboard in the backend
            const updateData: Partial<WhiteboardUpdateData> = {
                position: { x: d.x, y: d.y },
                updatedAt: new Date(),
            };

            await updateWhiteboard(id, updateData);
        } catch (err: any) {
            console.error('Failed to update whiteboard position:', err);
            alert(err.message || 'Failed to update whiteboard position');
        }
    };

    // Display a loading message while data is being fetched
    if (loading) {
        return <div className="p-5 text-center">Loading...</div>;
    }
    // Display an error message if fetching data fails
    if (error) {
        return <div className="p-5 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="relative w-full h-screen bg-gradient-to-b from-[#F7F1F0] to-[#C3A6A0]" onContextMenu={handleContextMenu}>
            {/* Render the sidebar and the main content */}
            <div className="flex">
                <div className="mt-0 ml-0 flex-shrink-0">
                    <Sidebar />
                </div>

                <div className="flex-grow ml-5">
                    <h2 className="text-4xl font-serif font-extrabold text-center text-[#262220] py-5 tracking-wide">
                        地圖
                    </h2>
                </div>
            </div>

            {/* Render all the whiteboards */}
            <div className="absolute top-0 left-0 w-full h-full p-6">
                {whiteboards.map((whiteboard) => (
                    <Rnd
                        key={whiteboard._id}
                        size={{ width: whiteboard.dimensions.width, height: whiteboard.dimensions.height }}
                        position={{ x: whiteboard.position.x, y: whiteboard.position.y }}
                        onDragStart={() => { draggedRef.current = false; }}
                        onDrag={() => { draggedRef.current = true; }}
                        onDragStop={(e, d) => { 
                            handleDragStop(whiteboard._id, d); 
                            draggedRef.current = true; 
                        }}
                        bounds="parent"
                        dragHandleClassName="drag-handle"
                        enableResizing={false} 
                    >
                        <div
                            className="relative bg-white border border-[#C3A6A0] shadow-xl rounded-2xl p-6 cursor-pointer transform transition-transform duration-300 hover:scale-110 hover:shadow-2xl"
                            onClick={() => {
                                if (!draggedRef.current) {
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

            {/* Context Menu for Adding Whiteboard */}
            {contextMenu && !isAdding && (
                <div
                    className="absolute bg-white border border-[#C3A6A0] shadow-lg rounded-lg p-2 z-50"
                    style={{
                        top: contextMenu.y,
                        left: contextMenu.x,
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
                    className="absolute bg-white border border-[#C3A6A0] shadow-lg rounded-lg p-6 z-50"
                    style={{
                        top: contextMenu.y,
                        left: contextMenu.x,
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

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={newWhiteboardPrivate}
                                onChange={(e) => setNewWhiteboardPrivate(e.target.checked)}
                                id="private"
                                className="mr-2"
                            />
                            <label htmlFor="private" className="text-sm text-[#262220]">私人白板</label>
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
