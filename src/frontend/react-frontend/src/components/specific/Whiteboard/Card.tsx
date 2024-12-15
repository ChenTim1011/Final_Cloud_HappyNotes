// src/components/specific/Whiteboard/Card.tsx 

import React, { useState, useEffect, useRef, useCallback } from 'react'; 
import { CardData } from '@/interfaces/Card/CardData'; 
import { Rnd } from 'react-rnd'; 
import Tag from '@/components/specific/Card/tag';
import QuillEditor from '../Card/text-editor/quilleditor';
import { useBatchUpdate } from '@/components/specific/Card/BatchUpdateContext';
import { toast } from 'react-toastify';
import debounce from 'lodash.debounce'; 
import './Card.css'; 

// Interface for Card component props extending CardData
interface CardProps extends CardData {
    onDelete: (cardId: string) => void; 
    isSelected: boolean; 
    onSelect: (cardId: string) => void; 
    onCopyCard: (card: CardData) => void; 
    setCards: React.Dispatch<React.SetStateAction<CardData[]>>;
    setFullscreenCardId: (id: string | null) => void; 
    onRightClick?: (e: React.MouseEvent, cardId: string) => void;
}

const MIN_HEIGHT = 300; // Adjust min height for QuillEditor
const MAX_HEIGHT = 800; 
const MIN_WIDTH = 300; 
const MAX_WIDTH = 800; 

const Card: React.FC<CardProps> = React.memo(({ 
    _id,
    cardTitle,
    content,
    dueDate,
    tag,
    foldOrNot,
    position,
    dimensions,
    connection,
    connectionBy,
    comments,
    onDelete, 
    isSelected, 
    onSelect, 
    onCopyCard,
    setCards,
    setFullscreenCardId, 
    onRightClick,
}) => {

    // Local state for editing mode and input values
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editedTitle, setEditedTitle] = useState<string>(cardTitle);
    const [editedContent, setEditedContent] = useState<string>(content);
    const [isFolded, setIsFolded] = useState<boolean>(!!foldOrNot);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false); 
    const [localDimensions, setLocalDimensions] = useState(dimensions);
    const [localPosition, setLocalPosition] = useState(position);
    
    const cardRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null); // Ref to the title element
    const contentRef = useRef<HTMLDivElement>(null); // Ref to QuillEditor content

    const { addCardUpdate } = useBatchUpdate();

    // Function to update card content with debounce
    const handleUpdateCard = useCallback((cardId: string, changes: Partial<CardData>) => {
        // Update card in local state
        addCardUpdate(cardId, changes);
    }, [addCardUpdate]);

    // Debounce the update function to batch updates
    const debouncedUpdate = useCallback(
        debounce((cardId: string, changes: Partial<CardData>) => {
            handleUpdateCard(cardId, changes);
        }, 5000), 
        [handleUpdateCard]
    );

    // Function to save edited content and update the card  
    const handleSave = useCallback(() => {
        if (_id) {
            const changes: Partial<CardData> = {
                tag: tag,
                cardTitle: editedTitle,
                content: editedContent,
                dimensions: localDimensions,
                connection: connection,
                connectionBy: connectionBy,
            };

            setCards(prevCards => {
                return prevCards.map(card => {
                    if (card._id === _id) {
                        return {
                            ...card,
                            ...changes
                        };
                    }
                    return card;
                });
            });

            handleUpdateCard(_id, changes);
            setIsEditing(false);

            // Optionally show a success Toast
            toast.success('卡片已保存');
        }
    }, [_id, editedTitle, editedContent, localDimensions, handleUpdateCard, setCards]);

    // Error handling: Ensure card ID is defined
    if (!_id) {
        console.error("Card component received undefined id");
        return null;
    }

    // Method to handle tag updates
    const handleTagUpdate = useCallback((newTag: string) => {
        if (_id) {
            setCards(prevCards => {
                return prevCards.map(card => {
                    if (card._id === _id) {
                        return {
                            ...card,
                            tag: newTag
                        };
                    }
                    return card;
                });
            });

            handleUpdateCard(_id, { tag: newTag });
        }
    }, [_id, handleUpdateCard, setCards]);

    // Function to handle card deletion with confirmation
    const handleDelete = useCallback((e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering onSelect
        const confirmDelete = window.confirm('你確定要刪除卡片嗎?');
        if (confirmDelete) {
            onDelete(_id);
        }
    }, [ _id, onDelete ]); 

    // Function to toggle fold state without affecting editing state  
    const handleToggleFold = useCallback((e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering onSelect
        
        setIsFolded((prev: boolean) => {
            const newFolded = !prev;
            
            if (newFolded) {
                // When folding: set height to title height + padding/margin
                if (titleRef.current && !isFullscreen) {
                    const titleHeight = titleRef.current.offsetHeight + 32; // 16px padding on top and bottom
                    const updatedHeight = Math.max(titleHeight, MIN_HEIGHT);
                    if (updatedHeight !== localDimensions.height) {
                        setLocalDimensions(prevDims => {
                            const newDims = {
                                ...prevDims,
                                height: updatedHeight
                            };
                            handleUpdateCard(_id, { 
                                dimensions: newDims,
                                foldOrNot: newFolded
                            });
                            return newDims;
                        });
                    }
                }
            } else {
                // When unfolding: adjust height based on content
                if (contentRef.current) {
                    const editor = contentRef.current.querySelector(".ql-editor");
                    if (editor) {
                        const fullHeight = editor.scrollHeight + (titleRef.current?.offsetHeight || 0) + 32; // Title height + padding
                        const updatedHeight = Math.max(fullHeight, MIN_HEIGHT);
                        if (updatedHeight !== localDimensions.height) {
                            setLocalDimensions(prevDims => {
                                const newDims = {
                                    ...prevDims,
                                    height: updatedHeight
                                };
                                handleUpdateCard(_id, { 
                                    dimensions: newDims,
                                    foldOrNot: newFolded
                                });
                                return newDims;
                            });
                        }
                    }
                }
            }
            return newFolded; // Explicitly return boolean for type safety
        });
    }, [_id, handleUpdateCard, isFullscreen, localDimensions.height]);

    // Function to handle content change with debounce
    const handleContentChange = useCallback((newContent: string) => {
        setEditedContent(newContent);

        // Update card content with debounce
        debouncedUpdate(_id, {
            content: newContent
        });
    }, [_id, debouncedUpdate]);

    // Function to handle height change from QuillEditor
    const handleQuillHeightChange = useCallback((newHeight: number) => {
        // Adjust card height based on QuillEditor content
        const titleHeight = titleRef.current?.offsetHeight || 0;
        const padding = 32; // Adjust this value based on actual padding and title height
        const totalHeight = newHeight + titleHeight + padding;
        const finalHeight = Math.min(totalHeight, MAX_HEIGHT);

        setLocalDimensions(prev => {
            const newDims = {
                ...prev,
                height: finalHeight
            };
            handleUpdateCard(_id, {
                dimensions: newDims
            });
            return newDims;
        });
    }, [_id, handleUpdateCard]);

    // Handle resize with immediate visual feedback
    const handleResize = useCallback((size: { width: number; height: number }, position: { x: number; y: number }) => {
        const newDimensions = {
            width: Math.max(size.width, MIN_WIDTH),
            height: Math.max(size.height, MIN_HEIGHT)
        };

        setLocalDimensions(newDimensions);
        setLocalPosition(position);

        // Use handleUpdateCard to batch update dimensions and position
        handleUpdateCard(_id, {
            dimensions: newDimensions,
            position: position
        });
    }, [_id, handleUpdateCard]);

    // Enter full screen mode
    const enterFullscreen = useCallback(() => {
        if (cardRef.current) {
            cardRef.current.requestFullscreen();
            setIsFullscreen(true);
        }
    }, []);

    // Exit full screen mode
    const exitFullscreen = useCallback(() => {
        document.exitFullscreen();
        setIsFullscreen(false);
    }, []);

    // Toggle full screen mode
    const toggleFullscreen = useCallback(() => {
        if (isFullscreen) {
            exitFullscreen();
        } else {
            enterFullscreen();
        }
    }, [isFullscreen, enterFullscreen, exitFullscreen]);

    // Reset local state when props change
    useEffect(() => {
        setLocalDimensions(dimensions);
        setLocalPosition(position);
    }, [dimensions, position]);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            debouncedUpdate.cancel();
        };
    }, [debouncedUpdate]);

    return (
        <Rnd
            size={isFullscreen ? { width: '100vw', height: '100vh' } : localDimensions}
            position={isFullscreen ? { x: 0, y: 0 } : localPosition}
            onDragStop={(e, d) => {
                if (!isFullscreen) { // Only handle drag stop if not fullscreen
                    handleResize({ width: localDimensions.width, height: localDimensions.height }, { x: d.x, y: d.y });
                }
            }}
            onResize={(e, direction, ref, delta, position) => {
                if (isFullscreen) return; 
                const newWidth = Math.max(parseInt(ref.style.width, 10), MIN_WIDTH);
                const newHeight = Math.max(parseInt(ref.style.height, 10), MIN_HEIGHT);
                setLocalDimensions({
                    width: newWidth,
                    height: newHeight
                });
                setLocalPosition(position);
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
                if (isFullscreen) return; 
                handleResize(
                    {
                        width: Math.max(parseInt(ref.style.width, 10), MIN_WIDTH),
                        height: Math.max(parseInt(ref.style.height, 10), MIN_HEIGHT)
                    },
                    position
                );
            }}
            bounds={'window'}  
            enableResizing={isFullscreen ? false : {  
                top: !isEditing,  
                right: true,  
                bottom: !isEditing,  
                left: true,  
                topRight: !isEditing,  
                bottomRight: !isEditing,  
                bottomLeft: !isEditing,  
                topLeft: !isEditing  
            }}  
            disableDragging={isEditing} // Disable dragging when editing
            onContextMenu={(e:any) => {
                e.stopPropagation(); 
                onRightClick?.(e, _id); 
            }}
            minHeight={MIN_HEIGHT}
            minWidth={MIN_WIDTH}
            maxHeight={isFullscreen ? '100vh' : MAX_HEIGHT} 
            maxWidth={isFullscreen ? '100vw' : MAX_WIDTH} 
            className={`${isSelected ? 'ring-4 ring-blue-500' : ''} ${isFullscreen ? 'fullscreen-card' : ''}`}   
            style={isFullscreen ? { position: 'fixed', top: 0, left: 0, zIndex: 9999 } : {}}
        >  
            <div  
                className={`bg-blue-100 border border-blue-300 p-4 rounded shadow relative h-full w-full flex flex-col ${
                    isEditing ? '' : 'select-none'
                } ${isFullscreen ? 'fullscreen-content' : ''}`}
                onDoubleClick={() => setIsEditing(true)}  
                onClick={() => onSelect(_id)}   
                ref={cardRef}  
                style={{ boxSizing: 'border-box', transition: 'none', overflow: 'hidden' }} // Remove transitions and prevent overflow
            >
                {/* Header with fixed buttons and title */}
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                    
                        {!isFullscreen && (
                            <>
                                {/* Fold button */}
                                <button
                                    onClick={handleToggleFold}
                                    className="text-gray-500 hover:text-gray-700 focus:outline-none"  
                                    style={{ fontSize: '1.25rem' }} 
                                    title={isFolded ? '展開卡片' : '摺疊卡片'}
                                >
                                    {isFolded ? '+' : '-'}
                                </button>

                                {/* Copy button */}
                                <button
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        onCopyCard({ 
                                            _id,
                                            cardTitle,
                                            content,
                                            dueDate,
                                            tag,
                                            foldOrNot,
                                            position,
                                            dimensions,
                                            connection,
                                            connectionBy,
                                            comments,
                                            createdAt: new Date(),
                                            updatedAt: new Date(),
                                        }); 
                                    }}
                                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                    style={{ fontSize: '1.25rem' }}
                                    title="複製卡片"
                                >
                                    📄
                                </button>
                            </>
                        )}

                        {/* Fullscreen button */}
                        <button
                            onClick={toggleFullscreen}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                            style={{ zIndex: 10 }}
                            title="全螢幕"
                        >
                            {isFullscreen ? '離開全螢幕' : '🖥️'}
                        </button>
                    </div>

                    {/* Delete button */}
                    <button
                        onClick={handleDelete}
                        className="text-red-500 hover:text-red-700 focus:outline-none" 
                        title="Delete Card"
                    >
                        &times;
                    </button>
                </div>

                {/* Tag Component */}
                <div className="mb-2">
                    <Tag currentTag={tag} onUpdateTag={handleTagUpdate} />
                </div>

                {/* Header with title and save button */}
                {isEditing && (
                    <div className="flex justify-between items-center mb-2">
                        {/* Title Input */}
                        <input  
                            type="text"  
                            value={editedTitle}  
                            onChange={(e) => setEditedTitle(e.target.value)}  
                            className="w-full px-2 py-1 border rounded mr-2 select-text"  
                            placeholder="Enter card title"  
                            style={{ boxSizing: 'border-box', transition: 'none' , userSelect: 'text'}}  
                        />

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            className="px-3 py-1 bg-black text-white rounded-lg hover:bg-gray-800 focus:outline-none transition duration-200 ease-in-out shadow-md transform hover:scale-105 flex items-center justify-center"
                            >
                            Save
                        </button>
                    </div>
                )}

                {/* Content Area */}
                <div className={`flex-grow ${isEditing ? 'select-text' : 'select-none'}`}>
                    {isEditing ? (
                        <div className="flex flex-col select-text">
                            {!isFolded && ( 
                                <> 
                                    {/* QuillEditor for editing the card content */} 
                                    <QuillEditor
                                        content={editedContent}
                                        handleContentChange2={handleContentChange}
                                        readOnly={false}
                                        theme="snow"
                                        onHeightChange={handleQuillHeightChange}
                                    />
                                </>  
                            )}
                        </div> 
                    ) : (  
                        <div className="flex flex-col">
                            <h3 ref={titleRef} className="text-lg font-semibold mt-2">{cardTitle}</h3>  
                            {!isFolded && (
                                <div className="mt-2">
                                    <QuillEditor
                                        content={content}
                                        handleContentChange2={() => {}} // No-op in read-only mode
                                        readOnly={true}
                                        theme="bubble"
                                        onHeightChange={handleQuillHeightChange}
                                    />
                                </div>
                            )}  
                        </div> 
                    )}
                </div>
            </div>
        </Rnd>  
    )
    });

    export default Card;
