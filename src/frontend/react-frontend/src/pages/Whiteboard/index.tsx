// src/pages/Whiteboard.tsx - Displays the whiteboard page with cards 

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '@/components/specific/Whiteboard/Card';
import { CardData } from '@/interfaces/Card/CardData';
import { WhiteboardData } from '@/interfaces/Whiteboard/WhiteboardData';
import { getUserById } from '@/services/userService';
import { getWhiteboardById, updateWhiteboard } from '@/services/whiteboardService';
import { deleteCard, createCard, updateCard } from '@/services/cardService';
import Sidebar from '@/components/common/sidebar';
import { toast } from 'react-toastify';
import { useUser } from '@/contexts/UserContext';

const Whiteboard: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentUser, userLoading } = useUser();
    const [whiteboard, setWhiteboard] = useState<WhiteboardData | null>(null);
    const [cards, setCards] = useState<CardData[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        actions?: ('add' | 'delete' | 'paste')[];
    } | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [copiedCard, setCopiedCard] = useState<CardData | null>(null); 

    const whiteboardRef = useRef<HTMLDivElement>(null); 

    // Fetch whiteboard and associated cards data when the component mounts or id changes
    useEffect(() => {
        const checkAccess = async () => {
          if (userLoading) {
            // User data is still loading, do nothing
            return;
          }
          if (!currentUser) {
            toast.error('請先登入');
            navigate('/auth/login');
            return;
          }
          if (!id) {
            toast.error('找不到白板');
            navigate(`/map/${currentUser.userName}`);
            return;
          }
        };
    
        checkAccess();
      }, [currentUser, id, navigate, userLoading]);

    // Fetch whiteboard data
    useEffect(() => {
        const fetchData = async () => {
            if (!id || !currentUser) return;

            try {
                const fetchedWhiteboard: WhiteboardData = await getWhiteboardById(id);
                
                // check if the current user has access to the whiteboard
                if (fetchedWhiteboard.userId !== currentUser._id) {
                    toast.error('沒有權限存取此白板');
                    navigate(`/map/${currentUser.userName}`);
                    return;
                }

                setWhiteboard(fetchedWhiteboard);
                setCards(fetchedWhiteboard.cards);
                setLoading(false);
            } catch (err: any) {
                console.error('Failed to fetch whiteboard data:', err);
                setError('Failed to fetch whiteboard data');
                setLoading(false);
            }
        };

        fetchData();
    }, [id, currentUser, navigate]);

    // Function to handle copying a card
    const handleCopyCard = (card: CardData) => {
        const cardWithoutPosition = {
            ...card,
        };
        setCopiedCard(cardWithoutPosition);
        toast.info('卡片已複製，您可以在空白區域右鍵選擇貼上。');
    };

    // Add a new card at the specified x and y coordinates
    const addCard = async (x: number, y: number, cardData?: CardData) => {
        // Early return if whiteboard is not loaded or ID is undefined
        if (!whiteboard || !whiteboard._id) {
            console.error("Whiteboard is not loaded or ID is undefined");
            return; 
        }

        const position = { 
            x: x - window.scrollX, 
            y: y - window.scrollY 
        };

        const newCardData: Omit<CardData, '_id'> = {
            cardTitle: cardData ? `${cardData.cardTitle} Copy` : '新卡片',
            content: cardData ? cardData.content : '新內容',
            createdAt: new Date(),
            updatedAt: new Date(),
            dueDate: cardData && cardData.dueDate ? new Date(cardData.dueDate) : new Date(),
            tag: cardData ? cardData.tag : '',
            foldOrNot: cardData ? cardData.foldOrNot : false, 
            position: position,
            dimensions: cardData ? { ...cardData.dimensions } : { width: 300, height: 300 },
            connection: cardData ? cardData.connection : [],
            comments: cardData ? cardData.comments : [],
        };

        try {
            // Create a new card and add it to the state
            const createdCard = await createCard(newCardData);
            console.log("Created Card:", createdCard);
            
            if (createdCard._id) {
                // Update the local state to include the new card
                setCards(prevCards => [...prevCards, createdCard]);

                // Update the whiteboard to include the new card
                const updatedCardIds = [...(whiteboard.cards || []).map(card => typeof card === 'string' ? card : card._id), createdCard._id];
                await updateWhiteboard(whiteboard._id, { cards: updatedCardIds });
            }
            setContextMenu(null);
        } catch (err: any) {
            console.error('Failed to add card:', err);
            toast.error(err.message || 'Failed to add card');
        }
    };

    // Delete a card: Deletes the specified card by ID
    const deleteCardHandler = async (cardId: string) => {
        if (cardId && whiteboard) {
            try {
                // Delete the card and update the state
                await deleteCard(cardId);

                // Update the local state to remove the deleted card
                setCards(prevCards => prevCards.filter((card) => card._id !== cardId));

                // Update the whiteboard's card list in the backend
                const updatedCardIds: string[] = whiteboard.cards
                    .filter((card) => typeof card === 'string' ? card !== cardId : card._id !== cardId)
                    .map((card) => typeof card === 'string' ? card : card._id);

                const updatedWhiteboard = await updateWhiteboard(whiteboard._id, { cards: updatedCardIds });
                setWhiteboard(updatedWhiteboard);
                
                // If the deleted card was selected, clear the selection
                if (selectedCardId === cardId) {
                    setSelectedCardId(null);
                }

                setContextMenu(null);
            } catch (err: any) {
                console.error('Failed to delete card:', err);
                toast.error(err.message || 'Failed to delete card');
            }
        }
    };

    // Update card content: Updates the content of a specific card
    const updateCardHandler = async (cardId: string, updatedFields: Partial<CardData>) => {
        try {
            // Update the card's content locally
            setCards((prevCards) => {
                if (!whiteboard) return prevCards;
                const updatedCards = prevCards.map((card) =>
                    card._id === cardId ? { ...card, ...updatedFields } : card
                );
                return updatedCards;
            });

            // Update the card in the backend
            await updateCard(cardId, updatedFields);
        } catch (err: any) {
            console.error('Failed to update card content:', err);
            toast.error(err.message || 'Failed to update card content');
        }
    };

    // Display the context menu for adding or deleting cards
    const handleRightClick = (e: React.MouseEvent, cardId?: string) => {
        e.preventDefault();
        setSelectedCardId(cardId || null);

        let relativeX = e.clientX;
        let relativeY = e.clientY;

        if (whiteboardRef.current) {
            const rect = whiteboardRef.current.getBoundingClientRect();
            relativeX = e.clientX - rect.left;
            relativeY = e.clientY - rect.top;
            console.log(`Relative Position - X: ${relativeX}, Y: ${relativeY}`);
        }

        console.log('Right-click detected on:', cardId ? `Card ${cardId}` : 'Empty area'); 

        setContextMenu({
            x: relativeX,
            y: relativeY,
            actions: [
                'add',
                ...(copiedCard ? ['paste'] : []),
                ...(cardId ? ['delete'] : [])
            ] as ('add' | 'delete' | 'paste')[]
        });
    };

    // Handle keydown events to delete the selected card
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Delete' && selectedCardId) {
            deleteCardHandler(selectedCardId);
        }
    };

    const handleSelectCard = (cardId: string) => {
        setSelectedCardId(cardId);
    };

    if (loading) {
        return <div className="p-5 text-center">Loading...</div>;
    }

    if (error) {
        return <div className="p-5 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="relative w-full h-screen bg-[#F7F1F0]">
            {/* Render the sidebar and the main content */}
            <div className="flex">
                {/* Sidebar */}
                <div className="fixed top-[-20px] left-0 h-screen w-64 z-50">
                    <Sidebar />
                </div>
        
                {/* Whiteboard Title Row */}
                <div className="flex-grow ml-5">
                    <div className="bg-[#F7F1F0] py-4 shadow-md rounded-b-lg">
                        <h2 className="text-4xl font-serif font-extrabold text-center text-black tracking-wide">
                            {whiteboard ? whiteboard.whiteboardTitle : '載入中...'}
                        </h2>
                    </div>
                </div>
            </div>
        
            {/* Main Content */}
            <div
                className="flex-grow overflow-auto bg-[#C3A6A0]"
                style={{ width: '10000px', height: '10000px' }}
                ref={whiteboardRef}
            >
                {/* Card Rendering Section */}
                {cards.map((card) => (
                    <Card
                        key={card._id}
                        {...card}
                        onDelete={deleteCardHandler}
                        isSelected={card._id === selectedCardId}
                        onSelect={handleSelectCard}
                        onCopyCard={handleCopyCard}
                        setCards={setCards}
                        setFullscreenCardId={setSelectedCardId}
                        onRightClick={(e) => handleRightClick(e, card._id)}
                    />
                ))}
        
                {/* Context Menu */}
                {contextMenu && (
                    <div
                        className="absolute bg-white border border-[#C3A6A0] text-[#262220] p-3 rounded-lg z-50 shadow-lg cursor-pointer"
                        style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {contextMenu.actions && contextMenu.actions.includes('add') && (
                            <div
                                className="py-2 px-4 hover:bg-[#F0E6E0] rounded"
                                onClick={() => addCard(contextMenu.x, contextMenu.y)}
                            >
                                新增卡片
                            </div>
                        )}
                        {contextMenu.actions && contextMenu.actions.includes('paste') && (
                            <div
                                className="py-2 px-4 hover:bg-[#F0E6E0] rounded"
                                onClick={() => {
                                    if (copiedCard) {
                                        addCard(contextMenu.x, contextMenu.y, copiedCard);
                                    }
                                }}
                            >
                                貼上卡片
                            </div>
                        )}
                        {selectedCardId && (
                            <div
                                className="py-2 px-4 hover:bg-[#F0E6E0] rounded"
                                onClick={() => {
                                    deleteCardHandler(selectedCardId);
                                }}
                            >
                                刪除卡片
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      );
};

export default Whiteboard;
