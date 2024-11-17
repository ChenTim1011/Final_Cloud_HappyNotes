// Whiteboard.tsx - Displays the whiteboard page with cards 

import React, { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import Card from '@/components/specific/Whiteboard/Card';
import { CardData } from '@/interfaces/Card/CardData';
import { WhiteboardData } from '@/interfaces/Whiteboard/WhiteboardData';
import { getAllCards, createCard, updateCard, deleteCard } from '@/services/cardService';
import { getWhiteboardById, updateWhiteboard } from '@/services/whiteboardService';


const Whiteboard: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [whiteboard, setWhiteboard] = useState<WhiteboardData | null>(null);
    const [cards, setCards] = useState<CardData[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        action?: 'add' | 'delete' | 'paste';
    } | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [copiedCard, setCopiedCard] = useState<CardData | null>(null); // 新增的狀態

    // Fetch whiteboard and associated cards data when the component mounts or id changes
    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                try {
                    // Fetch the whiteboard data by ID
                    const whiteboard = await getWhiteboardById(id);
                    setWhiteboard(whiteboard);

                    if (whiteboard && whiteboard._id) {
                        // Ensure whiteboard.cards is an array
                        if (!Array.isArray(whiteboard.cards)) {
                            whiteboard.cards = [];
                        }

                        // Set the cards for rendering
                        setCards(whiteboard.cards);
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

    // Function to handle copying a card
    const handleCopyCard = (card: CardData) => {
        setCopiedCard(card);
        alert('卡片已複製，您可以在空白區域右鍵選擇貼上。');
    };

    // Add a new card at the specified x and y coordinates
    const addCard = async (x: number, y: number, cardData?: CardData) => {
        // Early return if whiteboard is not loaded or ID is undefined
        if (!whiteboard || !whiteboard._id) {
            console.error("Whiteboard is not loaded or ID is undefined");
            return; 
        }

        const newCardData: Omit<CardData, '_id'> = {
            cardTitle: cardData ? `${cardData.cardTitle} ` : '新卡片',
            content: cardData ? cardData.content : '新內容',
            createdAt: new Date(),
            updatedAt: new Date(),
            dueDate: cardData && cardData.dueDate ? new Date(cardData.dueDate) : new Date(),
            tag: cardData ? cardData.tag : '',
            foldOrNot: cardData ? cardData.foldOrNot : false, 
            position: { x, y },
            dimensions: cardData ? cardData.dimensions : { width: 200, height: 150 },
            connection: cardData ? cardData.connection : [],
            comments: cardData ? cardData.comments : [],
        };

        try {
            // Create a new card and add it to the state
            const createdCard = await createCard(newCardData);
            console.log("Created Card:", createdCard);
            setCards([...cards, createdCard]);

            if (createdCard._id) {
                // Update whiteboard with the new card's ID
                const updatedCardIds: string[] = [...whiteboard.cards.map(card => card._id), createdCard._id];

                // Update the whiteboard's cards in the backend
                const updatedWhiteboard = await updateWhiteboard(whiteboard._id, { cards: updatedCardIds });
                
                setWhiteboard(updatedWhiteboard);
                setCards(updatedWhiteboard.cards);
            }
            setContextMenu(null);
        } catch (err: any) {
            console.error('Failed to add card:', err);
            alert(err.message || 'Failed to add card');
        }
    };

    // Delete a card: Deletes the specified card by ID
    const deleteCardHandler = async (cardId: string) => {
        if (cardId && whiteboard) {
            try {
                // Delete the card and update the state
                await deleteCard(cardId);

                // Update the local state to remove the deleted card
                setCards(cards.filter((card) => card._id !== cardId));

                // Update the whiteboard's card list in the backend
                const updatedCardIds: string[] = whiteboard.cards
                    .filter((card: CardData) => card._id !== cardId)
                    .map((card: CardData) => card._id)
                    .filter((id): id is string => id !== undefined);

                const updatedWhiteboard = await updateWhiteboard(whiteboard._id, { cards: updatedCardIds });
                setWhiteboard(updatedWhiteboard);
                
                // If the deleted card was selected, clear the selection
                if (selectedCardId === cardId) {
                    setSelectedCardId(null);
                }

                setContextMenu(null);
            } catch (err: any) {
                console.error('Failed to delete card:', err);
                alert(err.message || 'Failed to delete card');
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
            alert(err.message || 'Failed to update card content');
        }
    };

    // Display the context menu for adding or deleting cards
    const handleRightClick = (e: React.MouseEvent, cardId?: string) => {
        e.preventDefault();
        setSelectedCardId(cardId || null);
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            action: cardId ? 'delete' : (copiedCard ? 'paste' : 'add'), // 根據是否有複製的卡片決定行動
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
        <div
            className="relative w-full h-screen bg-white outline-none"
            onContextMenu={(e) => handleRightClick(e)}
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            <h2 className="text-2xl font-semibold mb-4">
                {whiteboard ? whiteboard.whiteboardTitle : 'Loading...'}
            </h2>

            {/* Card Rendering Section */}
            {cards.map((card) => (
                <Card
                    key={card._id}
                    {...card}
                    onUpdateCard={updateCardHandler}
                    onDelete={deleteCardHandler}
                    isSelected={card._id === selectedCardId}
                    onSelect={handleSelectCard}
                    onCopyCard={handleCopyCard} // 傳遞複製函數
                />
            ))}

            {/* Display the context menu for adding, deleting, or pasting cards */}
            {contextMenu && (
                <div
                    className="absolute bg-gray-800 text-white p-2 rounded z-50 cursor-pointer"
                    style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
                    onClick={(e) => e.stopPropagation()} // Prevent event bubbling
                >
                    {contextMenu.action === 'add' ? (
                        <div
                            className="py-1 px-2 hover:bg-gray-700"
                            onClick={() => addCard(contextMenu.x, contextMenu.y)}
                        >
                            新增卡片
                        </div>
                    ) : contextMenu.action === 'paste' ? (
                        <div
                            className="py-1 px-2 hover:bg-gray-700"
                            onClick={() => {
                                if (copiedCard) {
                                    addCard(contextMenu.x, contextMenu.y, copiedCard);
                                    // setCopiedCard(null);
                                }
                            }}
                        >
                            複製卡片
                        </div>
                    ) : (
                        <div
                            className="py-1 px-2 hover:bg-gray-700"
                            onClick={() => {
                                if (selectedCardId) {
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
    );
};

export default Whiteboard;
