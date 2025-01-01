// src/pages/Whiteboard.tsx - Displays the whiteboard page with cards 

import React, { useState, useEffect, useRef,useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '@/components/specific/Whiteboard/Card';
import { CardData } from '@/interfaces/Card/CardData';
import { WhiteboardData } from '@/interfaces/Whiteboard/WhiteboardData';
import { UserData } from '@/interfaces/User/UserData';
import { getUserFromToken } from '@/services/loginService';
import { getWhiteboardById, updateWhiteboard } from '@/services/whiteboardService';
import { deleteCard, createCard, updateCard } from '@/services/cardService';
import Sidebar from '@/components/common/sidebar';
import { toast } from 'react-toastify';

const Whiteboard: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);
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

    const [lastMousePosition, setLastMousePosition] = useState<{ x: number; y: number } | null>(null);
    const [connections, setConnections] = useState<
        Array<{
            id: string;
            startCardId: string; // 卡片 ID
            // startDirection: 'top' | 'bottom' | 'left' | 'right';
            startOffset: { x: number; y: number };
            endPoint: { x: number; y: number };
        }>
    >([]);
    const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);

    // 1. Get the current user use getUserFromToken
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const user: UserData = await getUserFromToken(); 
                setCurrentUser(user);
            } catch (error) {
                console.error('獲取當前用戶失敗：', error);
                toast.error('請先登入');
                navigate('/auth/login');
            }
        };
    
        fetchCurrentUser();
    }, [navigate]);

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
                const allConnections = fetchedWhiteboard.cards.flatMap((card) =>
                    (card.connections || []).map((connection) => ({
                        ...connection,
                        startCardId: card._id, // 為每個 connection 添加 startCardId
                    }))
                );
                setConnections(allConnections);

                setWhiteboard(fetchedWhiteboard);
                setCards(fetchedWhiteboard.cards);
                setLoading(false);
            } catch (err: any) {
                console.error('Failed to fetch whiteboard data:', err);
                setError('Failed to fetch whiteboard data');
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchData();
        }
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
    const addCard = useCallback(
        async (x: number, y: number, cardData?: CardData) => {
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
                connections: cardData ? cardData.connections : [],
                comments: cardData ? cardData.comments : [],
            };

            try {
                const createdCard = await createCard(newCardData);
                console.log("Created Card:", createdCard);

                if (createdCard._id) {
                    setCards(prevCards => [...prevCards, createdCard]);

                    const updatedCardIds = [...(whiteboard.cards || []).map(card => typeof card === 'string' ? card : card._id), createdCard._id];
                    await updateWhiteboard(whiteboard._id, { cards: updatedCardIds });
                }
                setContextMenu(null);
            } catch (err: any) {
                console.error('Failed to add card:', err);
                toast.error(err.message || 'Failed to add card');
            }
        },
        [whiteboard, setCards, setContextMenu]
    );

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

    // Handle click outside: Closes the context menu when clicked outside
    const handleClickOutside = (e: MouseEvent) => {
        if (contextMenu && e.button === 0) { 
            setContextMenu(null);
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
        }

        let actions: ('add' | 'delete' | 'paste')[] = [];
        if (cardId) {
            // If a card is right-clicked, show the delete option
            actions = ['delete'];
        } else {
            // If the space is right-clicked, show the add option
            actions = ['add', ...(copiedCard ? ['paste'] : [])] as ('add' | 'delete' | 'paste')[];
        }

        setContextMenu({
            x: relativeX,
            y: relativeY,
            actions: actions,
        });
    };

    // Handle keydown events to delete the selected card
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ( e.key === 'Delete' && selectedConnectionId) {
            return;
        }

        if (e.key === 'Delete' && selectedCardId) {
            const userConfirmed = window.confirm("你確定要刪除卡片嗎?");
            if (userConfirmed) {
                deleteCardHandler(selectedCardId);
            }
        }
        if ( selectedCardId == null && (e.ctrlKey || e.metaKey) && e.key === 'v') {
            e.preventDefault(); // 阻止默認行為
            if (copiedCard) {
                const pastePosition = lastMousePosition || { x: window.innerWidth / 2, y: window.innerHeight / 2 }; // 默認為螢幕中心
                addCard(pastePosition.x, pastePosition.y, copiedCard);
                //console.log('Card pasted at:', { x: centerX, y: centerY });
            } else {
                console.warn('No card to paste');
            }
        }
    };


    const handleSelectCard = (cardId: string | null) => {
        if (cardId === null) {
            setSelectedCardId(null);
        }
        else {
            setSelectedCardId(cardId);
        }

    };

    useEffect(() => {
        const listener = (e: MouseEvent) => handleClickOutside(e);
        window.addEventListener('click', listener);
        return () => {
            window.removeEventListener('click', listener);
        };
    }, [contextMenu]);
    const updateConnectionsForCard = (cardId: string, newPosition: { x: number; y: number }) => {
        setConnections((prevConnections) =>
            prevConnections.map((connection) => {
                if (connection.startCardId === cardId) {
                    // 根據新的卡片位置和 startOffset 計算新的 startPoint
                    const newStartPoint = {
                        x: newPosition.x + connection.startOffset.x,
                        y: newPosition.y + connection.startOffset.y,
                    };

                    return { ...connection, startPoint: newStartPoint };
                }

                return connection;
            })
        );
    };
    const handleDeleteConnectionFromCard = (connectionId: string) => {
        setConnections((prevConnections) =>
            prevConnections.filter((connection) => connection.id !== connectionId)
        );
    };


    const handleStartConnection = (
        cardId: string,
        startPoint: { x: number; y: number }
    ) => {
        //console.log("SSSSSSSSSS", { cardId, startPoint });
        if (!startPoint) {
            console.error('Start point is undefined');
            return;
        }

        const startCard = cards.find(card => card._id === cardId);
        if (!startCard) {
            console.error(`Card with ID ${cardId} not found`);
            return;
        }
    };

    if (loading) {
        return <div className="p-5 text-center">Loading...</div>;
    }

    if (error) {
        return <div className="p-5 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="relative w-full h-screen bg-[#F7F1F0]" onContextMenu={(e) => handleRightClick(e)} role="application" tabIndex={0}>
            {/* Render the sidebar */}
            <Sidebar currentUser={currentUser} setCurrentUser={setCurrentUser} />

            {/* Main content */}
            <div className="flex flex-col h-full">
                {/* Whiteboard Title Row */}
                <div className="flex-grow">
                    <div className="bg-[#F7F1F0] py-4 shadow-md rounded-b-lg">
                        <h2 className="text-4xl font-serif font-extrabold text-center text-black tracking-wide">
                            {whiteboard ? whiteboard.whiteboardTitle : '載入中...'}
                        </h2>
                    </div>
                </div>

                {/* Whiteboard Content */}
                <div
                    className="overflow-auto bg-[#C3A6A0] relative"
                    style={{ minWidth: '10000px', minHeight: '10000px', width: '100%', height: '100%',outline: 'none'  }}
                    ref={whiteboardRef}
                    onContextMenu={(e) => handleRightClick(e)}
                    onKeyDown={handleKeyDown}
                    onClick={(e) => {
                        setContextMenu(null);
                        setSelectedCardId(null);

                        // 記錄滑鼠座標
                        setLastMousePosition({
                            x: e.clientX,
                            y: e.clientY,
                        });
                    }}
                    tabIndex={0}
                >
                    {/* Card Rendering Section */}
                    {cards.map((card) => {
                        //console.log("CCCCCCCCCCCCCCCCCCCconnections:", connections)
                        const relatedConnections = connections
                            .filter((connection) => connection.startCardId === card._id)
                            .map(({ id, startOffset, endPoint }) => ({
                                id,
                                startOffset,
                                endPoint,
                            })); // 移除 startCardId
                        //console.log("relatedConnections:", relatedConnections)
                        return (

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
                                onStartConnection={handleStartConnection}
                                allCards={cards}
                                onPositionChange={(cardId, newPosition) => {
                                    updateConnectionsForCard(cardId, newPosition);
                                }}
                                connections={relatedConnections}
                                setSelectedConnectionId={setSelectedConnectionId}
                                onDeleteConnection={handleDeleteConnectionFromCard}
                            />
                        );
                    })}

                    {/* Context Menu */}
                    {contextMenu && (
                        <div
                            className="absolute bg-white border border-[#C3A6A0] text-[#262220] p-3 rounded-lg shadow-lg cursor-pointer"
                            style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px`, zIndex: 800 }}
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
                                        const confirmDelete = window.confirm('你確定要刪除這張卡片嗎？');
                                        if (confirmDelete) {
                                            deleteCardHandler(selectedCardId);
                                        }
                                    }}
                                >
                                    刪除卡片
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Whiteboard;
