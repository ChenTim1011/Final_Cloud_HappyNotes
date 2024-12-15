// react-frontend/src/components/specific/Whiteboard/Card.tsx

import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'; 
import { CardData } from '@/interfaces/Card/CardData'; 
import { Rnd } from 'react-rnd'; 
import ResizeObserver from 'resize-observer-polyfill'; 
import Tag from '@/components/specific/Card/tag';
import QuillEditor from '../Card/text-editor/quilleditor.js';


// Interface for Card component props extending CardData
interface CardProps extends CardData {
    onUpdateCard: (cardId: string, updatedFields: Partial<CardData>) => void;
    onDelete: (cardId: string) => void; 
    isSelected: boolean; 
    onSelect: (cardId: string) => void; 
    onCopyCard: (card: CardData) => void; 
    onRightClick?: (e: React.MouseEvent, cardId: string) => void;
}

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
    onUpdateCard,
    onDelete, 
    isSelected, 
    onSelect, 
    onCopyCard,
    onRightClick,
}) => {
    // Local state for editing mode and input values
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editedTitle, setEditedTitle] = useState<string>(cardTitle);
    const [editedContent, setEditedContent] = useState<string|any>(content);
    const [isFolded, setIsFolded] = useState<boolean>(!!foldOrNot);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false); 
    const [localDimensions, setLocalDimensions] = useState(dimensions);
    const [localPosition, setLocalPosition] = useState(position);
    
    const cardRef = useRef<HTMLDivElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null); // Ref to the title element
    const prevHeightRef = useRef<number>(dimensions.height); // Store previous height
    const isAdjustingRef = useRef<boolean>(false); // Flag to prevent infinite loop
    const lastInteractionRef = useRef<number>(Date.now());
    const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Function to update server state with debounce
    const debouncedUpdate = useCallback((updates: Partial<CardData>) => {
        // Clear any pending timeouts
        if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
        }

        // Set new timeout to update server
        updateTimeoutRef.current = setTimeout(() => {
            const timeSinceLastInteraction = Date.now() - lastInteractionRef.current;
            
            // Only update if user hasn't interacted in the last 5 seconds
            if (timeSinceLastInteraction >= 5000 && !isAdjustingRef.current) {
                isAdjustingRef.current = true;
                onUpdateCard(_id, updates);
                setTimeout(() => {
                    isAdjustingRef.current = false;
                }, 100);
            }
        }, 2000);
    }, [_id, onUpdateCard]);

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


    // Function to save edited content and update the card  
    const handleSave = useCallback(() => {
        if (_id) {
            onUpdateCard(_id, {  
                cardTitle: editedTitle,  
                content: editedContent,  
                dimensions: { 
                    width: dimensions.width, 
                    height: dimensions.height, 
                } ,
                updatedAt: new Date()  
            });  
            setIsEditing(false);  
        }  
    }, [_id, onUpdateCard, editedTitle, editedContent]);
    // Error handling: Ensure card ID is defined
    if (!_id) {
        console.error("Card component received undefined id");
        return null;
    }

    // Method to handle tag updates
   const handleTagUpdate = (newTag: string) => {
        if (_id) {
            onUpdateCard(_id, { tag: newTag });
        }
    };

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
        setIsFolded(prev => {  
            const newFolded = !prev;  
            if (newFolded) {  
                // Folding: set height to title's height + padding/margin
                if (titleRef.current) {  
                    const titleHeight = titleRef.current.offsetHeight + 32; // 16px padding top and bottom
                    // Only update if different
                    if (titleHeight !== dimensions.height) {
                        onUpdateCard(_id, { dimensions: { width: dimensions.width, height: titleHeight } });  
                        prevHeightRef.current = titleHeight; // Update previous height
                    }
                }  
            } else {  
                // Unfolding: set height based on content 
                if (cardRef.current) {  
                    const fullHeight = cardRef.current.scrollHeight;  
                    // Only update if different
                    if (fullHeight !== dimensions.height) {
                        onUpdateCard(_id, { dimensions: { width: dimensions.width, height: fullHeight } });  
                        prevHeightRef.current = fullHeight; // Update previous height
                    }
                }  
            }  
            return newFolded;  
        });  
    }, [ onUpdateCard, _id, dimensions.width, dimensions.height ]); 




    // Function to handle content change
    const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditedContent(e.target.value);
        lastInteractionRef.current = Date.now();

        if (textAreaRef.current) {
            textAreaRef.current.style.height = 'auto'; // Reset height to auto  
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;  

            const newHeight = Math.max(textAreaRef.current.scrollHeight, 100);
            setLocalDimensions(prev => ({
                ...prev,
                height: newHeight
            }));

            // Debounced server update
            debouncedUpdate({
                content: e.target.value,
                dimensions: {
                    width: localDimensions.width,
                    height: newHeight
                }
            });
        }
    }, [localDimensions.width, debouncedUpdate]); 

    const handleContentChange2 = (newContent: any) => {
        setEditedContent(newContent);
    };

    // Handle resize with immediate visual feedback
    const handleResize = useCallback((size: { width: number; height: number }, position: { x: number; y: number }) => {
        lastInteractionRef.current = Date.now();
        
        // Immediate UI update
        setLocalDimensions({
            width: Math.max(size.width, 150),
            height: Math.max(size.height, 100)
        });
        setLocalPosition(position);

        // Debounced server update
        debouncedUpdate({
            dimensions: {
                width: Math.max(size.width, 150),
                height: Math.max(size.height, 100)
            },
            position
        });
    }, [debouncedUpdate]);


    // Ensure the textarea resizes correctly when entering edit mode 
    useLayoutEffect(() => { 
        if (isEditing && textAreaRef.current) { 
            textAreaRef.current.style.height = 'auto'; // Reset height to auto before measuring 
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`; 
        } 
    }, [isEditing]); 


    // Reset local state when props change
    useEffect(() => {
        setLocalDimensions(dimensions);
        setLocalPosition(position);
    }, [dimensions, position]);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
            isAdjustingRef.current = false;
        };
    }, []);

    return (
        <Rnd
            size={localDimensions}
            position={localPosition}
            onDragStop={(e, d) => {
                handleResize(localDimensions, { x: d.x, y: d.y });
            }}
            onResize={(e, direction, ref, delta, position) => {
                // Immediate visual feedback during resize
                setLocalDimensions({
                    width: Math.max(parseInt(ref.style.width, 10), 150),
                    height: Math.max(parseInt(ref.style.height, 10), 100)
                });
                setLocalPosition(position);
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
                handleResize(
                    {
                        width: Math.max(parseInt(ref.style.width, 10), 150),
                        height: Math.max(parseInt(ref.style.height, 10), 100)
                    },
                    position
                );
            }}
            bounds={'window'}  
            enableResizing={{  
                top: !isEditing,  
                right: true,  
                bottom: !isEditing,  
                left: true,  
                topRight: !isEditing,  
                bottomRight: !isEditing,  
                bottomLeft: !isEditing,  
                topLeft: !isEditing  
            }}  
            className={`${isSelected ? 'ring-4 ring-blue-500' : ''}`}   
            disableDragging={false} // Allow dragging 
            onContextMenu={(e) => {
                //e.preventDefault(); // 阻止預設右鍵菜單
                e.stopPropagation(); // 防止事件冒泡
                onRightClick?.(e, _id); // 調用父層傳入的 onRightClick 回調，並傳遞卡片的 ID
            }}
        >  
            <div  
                className={`bg-blue-100 border border-blue-300 p-4 rounded shadow relative h-full w-full flex flex-col`}  
                onDoubleClick={() => setIsEditing(true)}  
                onClick={() => onSelect(_id)}   
                ref={cardRef}  
                style={{ boxSizing: 'border-box', transition: 'none', overflow: 'hidden' }} // Remove transitions and prevent overflow
            >
                {/* Fold button */}
                <button
                    onClick={handleToggleFold}
                    className="absolute top-0 left-2 text-gray-500 hover:text-gray-700 focus:outline-none"  
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
                            createdAt: new Date(), // Add createdAt
                            updatedAt: new Date(), // Add updatedAt
                        }); 
                    }}
                    className="absolute top-0 left-8 text-gray-500 hover:text-gray-700 focus:outline-none"
                    style={{ fontSize: '1.25rem' }}
                    title="複製卡片"
                >
                    📄
                </button>

                {/* Fullscreen button  */}
                <button
                    onClick={toggleFullscreen}
                    className="absolute top-0 left-16 text-black-500 hover:text-gray-700 focus:outline-none"
                    style={{ zIndex: 10 }}
                    title="全螢幕"
                >
                    {isFullscreen ?   '離開全螢幕' : '🖥️'}
                </button>

                {/* Add Tag component */}
                <Tag currentTag={tag} onUpdateTag={handleTagUpdate} />

                {/* Delete button */} 
                <button
                    onClick={handleDelete}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 focus:outline-none" 
                    title="Delete Card"
                >
                    &times;
                </button>


                {isEditing ? (
                    <div className="flex flex-col">

                        {/* Button to save changes */}  
                        <button  
                            onClick={handleSave}  
                            className="mb-2 px-3 py-1 bg-black text-white rounded-lg hover:bg-gray-800 focus:outline-none transition duration-200 ease-in-out shadow-md transform hover:scale-105 self-end"  
                        >  
                            儲存 
                        </button>  

                        {/* Edit content */}
                        <input  
                            type="text"  
                            value={editedTitle}  
                            onChange={(e) => setEditedTitle(e.target.value)}  
                            className="w-full px-2 py-1 border rounded mb-2 drag-handle"  
                            placeholder="Enter card title"  
                            style={{ boxSizing: 'border-box', transition: 'none' }}  
                        />  
                        {!isFolded && (             
                            <> 
                                {/* TextEditor for editing the card content */} 
                                <QuillEditor
                                    content={editedContent}
                                    handleContentChange2={handleContentChange2}
                                />
                                {/* Textarea for editing the card content  
                                <textarea  
                                    ref={textAreaRef}  
                                    placeholder="Enter content here"  
                                    value={editedContent}  
                                    onChange={handleContentChange}  
                                    className="w-full p-2 border rounded resize-none" 
                                    style={{ overflow: 'auto', boxSizing: 'border-box', transition: 'none' }}  
                                />   */}
                            </> 
                        )} 




                    </div> 
                ) : (  
                    <div className="flex flex-col"> 
                        <h3 ref={titleRef} className="text-lg font-semibold drag-handle" style={{ transition: 'none' , marginTop: '8px' }}>{cardTitle}</h3>  
                        {!isFolded && <p className="mt-2 whitespace-pre-wrap" style={{ transition: 'none', marginTop: '8px' }}>{content}</p>}  
                    </div> 
                )}  
            </div>  
        </Rnd>  
    ); 

}); 

export default Card;
