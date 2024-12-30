// src/pages/Whiteboard.tsx - Displays the whiteboard page with cards 
import React, { useState, useEffect, useRef,useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Card from '@/components/specific/Whiteboard/Card';
import { CardData } from '@/interfaces/Card/CardData';
import { WhiteboardData } from '@/interfaces/Whiteboard/WhiteboardData';
import { getWhiteboardById, updateWhiteboard } from '@/services/whiteboardService';
import { deleteCard, createCard, addConnection } from '@/services/cardService';
import Sidebar from '@/components/common/sidebar';
import { toast } from 'react-toastify';

const Whiteboard: React.FC = () => {
    const { id } = useParams<{ id: string }>();
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
    const whiteboardRef = useRef<HTMLDivElement>(null);
    const [lastMousePosition, setLastMousePosition] = useState<{ x: number; y: number } | null>(null);

    // Fetch whiteboard and associated cards data when the component mounts or id changes
    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                try {
                    // Fetch the whiteboard data by ID
                    const fetchedWhiteboard = await getWhiteboardById(id);
                    setWhiteboard(fetchedWhiteboard);

                    if (fetchedWhiteboard && fetchedWhiteboard._id) {
                        // Ensure whiteboard.cards is an array
                        if (!Array.isArray(fetchedWhiteboard.cards)) {
                            fetchedWhiteboard.cards = [];
                        }
                        const allConnections = fetchedWhiteboard.cards.flatMap((card) =>
                            (card.connections || []).map((connection) => ({
                                ...connection,
                                startCardId: card._id, // 為每個 connection 添加 startCardId
                            }))
                        );
                        setConnections(allConnections);
                        //console.log("connections:",connections)
                        //connections

                        // Set the cards for rendering  
                        setCards(fetchedWhiteboard.cards);
                        setLoading(false);
                    } else {
                        console.error("Whiteboard data does not have an ID");
                        setError('Whiteboard data is invalid');
                        setLoading(false);
                    }
                } catch (err) {
                    console.error('Failed to fetch whiteboard data:', err);
                    setError('Failed to fetch whiteboard data');
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [id]);


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
    // Function to handle copying a card
    const handleCopyCard = (card: CardData) => {
        const cardWithoutPosition = {
            ...card,
        };
        setCopiedCard(cardWithoutPosition);
        toast.info('卡片已複製，您可以在空白區域右鍵選擇貼上。');
    };
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
    const handleDeleteConnectionFromCard = (connectionId: string) => {
        setConnections((prevConnections) =>
            prevConnections.filter((connection) => connection.id !== connectionId)
        );
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
        if (e.key === 'Delete' && selectedConnectionId) {
            return;
        }

        if (e.key === 'Delete' && selectedCardId) {
            const userConfirmed = window.confirm("你確定要刪除卡片嗎?");
            if (userConfirmed) {
                deleteCardHandler(selectedCardId);
            }
        }
    };
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // 檢查是否按下 Ctrl+V 或 Cmd+V
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
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
        const handleMouseDown = (e: MouseEvent) => {
            setLastMousePosition({ x: e.clientX, y: e.clientY });
        };
    
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('mousedown', handleMouseDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousedown', handleMouseDown);
        };
    }, [copiedCard, addCard,lastMousePosition]);
    

    const handleSelectCard = (cardId: string | null) => {
        if (cardId === null){
            setSelectedCardId(null);
        }
        else{
            setSelectedCardId(cardId);
        }

    };
    if (loading) {
        return <div className="p-5 text-center">Loading...</div>;
    }

    if (error) {
        return <div className="p-5 text-center text-red-500">{error}</div>;
    }


    
    return (
        <div
            ref={whiteboardRef}
            className="relative w-full h-screen bg-white outline-none"
            onClick={() => { setContextMenu(null); setSelectedCardId(null) }}
            onContextMenu={(e) => handleRightClick(e)}
            onKeyDown={handleKeyDown}
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
                console.log("relatedConnections:", relatedConnections)
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
                        onPositionChange={(cardId, newPosition) => {
                            updateConnectionsForCard(cardId, newPosition);
                        }}
                        connections={relatedConnections}
                        setSelectedConnectionId={setSelectedConnectionId}
                        onDeleteConnection={handleDeleteConnectionFromCard}
                        allCards={cards} 
                        //setConnections={setConnections}
                    />
                );
            })}
            {/* 渲染所有固定的連線 */}
            {/*<svg
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                }}
            >
                {connections.map((connection) => (
                    <line
                        key={connection.id}
                        x1={connection.startPoint.x}
                        y1={connection.startPoint.y}
                        x2={connection.endPoint.x}
                        y2={connection.endPoint.y}
                        stroke="black"
                        strokeWidth="2"
                        style={{ pointerEvents: 'auto' }}
                        onClick={() => console.log(`Clicked on line with id: ${connection.id}`)} // 點擊事件處理器
                    />
                ))}
            </svg>*/}

            {/* Render the sidebar and the main content */}
            <div className="flex">

                <div className="mt-0 ml-0 flex-shrink-0">
                    <Sidebar />
                </div>

                <div className="flex-grow ml-5">
                    <h2 className="text-2xl text-center font-semibold p-5">
                        {whiteboard ? whiteboard.whiteboardTitle : 'Loading...'}
                    </h2>

                </div>
            </div>

            {/* Display the context menu for adding, deleting, or pasting cards */}
            {contextMenu && (
                <div
                    className="absolute bg-gray-800 text-white p-2 rounded z-50 cursor-pointer"
                    style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
                    onClick={(e) => e.stopPropagation()} // Prevent event bubbling
                >
                    {contextMenu.actions && contextMenu.actions.includes('add') && (
                        <div
                            className="py-1 px-2 hover:bg-gray-700"
                            onClick={() => addCard(contextMenu.x, contextMenu.y)}
                        >
                            新增卡片
                        </div>
                    )}
                    {contextMenu.actions && contextMenu.actions.includes('paste') && (
                        <div
                            className="py-1 px-2 hover:bg-gray-700"
                            onClick={() => {
                                if (copiedCard) {
                                    addCard(contextMenu.x, contextMenu.y, copiedCard);
                                    // setCopiedCard(null);
                                }
                            }}
                        >
                            貼上卡片
                        </div>
                    )}
                    {selectedCardId && (
                        <div
                            className="py-1 px-2 hover:bg-gray-700"
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
    );
};

export default Whiteboard;
