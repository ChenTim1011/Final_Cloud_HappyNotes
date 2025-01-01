// src/components/specific/Whiteboard/Card.tsx 
import { v4 as uuidv4 } from 'uuid';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CardData } from '@/interfaces/Card/CardData';
import { Rnd } from 'react-rnd';
import Tag from '@/components/specific/Card/tag';
import QuillEditor from '../Card/text-editor/quilleditor';
import { useBatchUpdate } from '@/components/specific/Card/BatchUpdateContext';
import { toast } from 'react-toastify';
import debounce from 'lodash.debounce';
import './Card.css';
import { deleteConnection, updateConnection, addConnection } from '@/services/cardService';

type DraggingConnection = {
  connectionId: string;
  type: 'start' | 'end';
};
interface ConnectionType {
  id: string;
  startCardId: string;
  startOffset: { x: number; y: number };
  endPoint: { x: number; y: number };
}
// Interface for Card component props extending CardData
interface CardProps extends CardData {
  onDelete: (cardId: string) => void;
  isSelected: boolean;
  onSelect: (cardId: string | null) => void;
  onCopyCard: (card: CardData) => void;
  setCards: React.Dispatch<React.SetStateAction<CardData[]>>;
  setFullscreenCardId: (id: string | null) => void;
  onRightClick?: (e: React.MouseEvent, cardId: string) => void;
  onStartConnection?: (cardId: string, startOffset: { x: number; y: number }, startPoint: { x: number; y: number }) => void;
  allCards: CardData[];
  onPositionChange?: (cardId: string, newPosition: { x: number; y: number }) => void;
  connections: ConnectionType[];
  setSelectedConnectionId: React.Dispatch<React.SetStateAction<string | null>>;
  onDeleteConnection?: (connectionId: string) => void;
}

const MIN_HEIGHT = 0; // Adjust min height for QuillEditor
const MAX_HEIGHT = 9000;
const MIN_WIDTH = 0;
const MAX_WIDTH = 9000;

const Card: React.FC<CardProps> = React.memo(({
  _id,
  cardTitle,
  content,
  dueDate,
  tag,
  foldOrNot,
  position,
  dimensions,
  connections,
  //connectionBy,
  comments,
  onDelete,
  isSelected,
  onSelect,
  onCopyCard,
  setCards,
  setFullscreenCardId,
  onStartConnection,
  onRightClick,
  allCards,
  onPositionChange,
  onDeleteConnection,
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
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [activeConnection, setActiveConnection] = useState<{
    startPoint: { x: number; y: number };
    endPoint: { x: number; y: number };
  } | null>(null);
  const { addCardUpdate } = useBatchUpdate();

  const [localConnections, setLocalConnections] = useState(connections || []);

  const [draggingConnection, setDraggingConnection] = useState<{
    connectionId: string;
    type: 'start' | 'end';
  } | null>(null);
  const draggingConnectionRef = useRef<DraggingConnection | null>(null);
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
  const handleStartConnectionMouseDown = (
    e: React.MouseEvent,
    direction: 'top' | 'bottom' | 'left' | 'right'
  ) => {
    e.stopPropagation();
    e.preventDefault(); // 防止默認行為

    // 以卡片的 position 為基準計算起點
    let startX = 0;
    let startY = 0;

    switch (direction) {
      case 'top':
        startX = position.x + localDimensions.width / 2; // 中心的 X 座標
        startY = position.y; // 卡片的上邊緣
        break;
      case 'bottom':
        startX = position.x + localDimensions.width / 2; // 中心的 X 座標
        startY = position.y + localDimensions.height; // 卡片的下邊緣
        break;
      case 'left':
        startX = position.x; // 卡片的左邊緣
        startY = position.y + localDimensions.height / 2; // 中心的 Y 座標
        break;
      case 'right':
        startX = position.x + localDimensions.width; // 卡片的右邊緣
        startY = position.y + localDimensions.height / 2; // 中心的 Y 座標
        break;
      default:
        console.error('Invalid direction:', direction);
        return;
    }

    // 設置連線的起點和終點
    const startPoint = { x: startX, y: startY };
    setActiveConnection({ startPoint, endPoint: startPoint });

    // 如果有回調函數，將連線的初始信息傳遞給父組件
    if (onStartConnection) {
      onStartConnection(_id, { x: startX, y: startY }, { x: e.clientX, y: e.clientY });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingConnectionRef.current) return; // 確保 ref 始終是最新值
      //console.log("draggingConnectionRef:",draggingConnectionRef)

      const { connectionId, type } = draggingConnectionRef.current;

      setLocalConnections((prevConnections) =>
        prevConnections.map((conn) => {
          if (conn.id === connectionId) {
            if (type === 'start') {
              const rect = cardRef.current?.getBoundingClientRect();
              if (!rect) return conn;

              const mouseX = e.clientX;
              const mouseY = e.clientY;

              // 限制滑鼠位置在卡片邊框
              const isCloserToVerticalEdge =
                Math.min(Math.abs(mouseX - rect.left), Math.abs(mouseX - rect.right)) <
                Math.min(Math.abs(mouseY - rect.top), Math.abs(mouseY - rect.bottom));

              let clampedX = mouseX;
              let clampedY = mouseY;

              if (isCloserToVerticalEdge) {
                // 靠近左或右邊
                clampedX = mouseX < rect.left + rect.width / 2 ? rect.left : rect.right;
                clampedY = Math.max(rect.top, Math.min(mouseY, rect.bottom));
              } else {
                // 靠近上或下邊
                clampedY = mouseY < rect.top + rect.height / 2 ? rect.top : rect.bottom;
                clampedX = Math.max(rect.left, Math.min(mouseX, rect.right));
              }

              // 計算 startOffset
              const offsetX = clampedX - rect.left;
              const offsetY = clampedY - rect.top;

              return { ...conn, startOffset: { x: offsetX, y: offsetY } };
            } else {
              // 自動校正邏輯 - 尋找最近的卡片並修正終點
              const mouseX = e.clientX;
              const mouseY = e.clientY;

              let nearestCard = null;
              let nearestPoint: { x: number; y: number } = { x: mouseX, y: mouseY };

              // 遍歷所有卡片，找到最近的邊界
              allCards.forEach((card) => {
                if (card._id === _id) return; // 跳過當前卡片

                const rect = {
                  top: card.position.y,
                  bottom: card.position.y + card.dimensions.height,
                  left: card.position.x,
                  right: card.position.x + card.dimensions.width,
                };

                let clampedX = mouseX;
                let clampedY = mouseY;

                if (
                  mouseX > rect.left &&
                  mouseX < rect.right &&
                  mouseY > rect.top &&
                  mouseY < rect.bottom
                ) {
                  // 滑鼠在卡片內部，校正到邊界
                  const isCloserToVerticalEdge =
                    Math.min(Math.abs(mouseX - rect.left), Math.abs(mouseX - rect.right)) <
                    Math.min(Math.abs(mouseY - rect.top), Math.abs(mouseY - rect.bottom));

                  if (isCloserToVerticalEdge) {
                    clampedX = mouseX < rect.left + (rect.right - rect.left) / 2 ? rect.left : rect.right;
                    clampedY = Math.max(rect.top, Math.min(mouseY, rect.bottom));
                  } else {
                    clampedY = mouseY < rect.top + (rect.bottom - rect.top) / 2 ? rect.top : rect.bottom;
                    clampedX = Math.max(rect.left, Math.min(mouseX, rect.right));
                  }
                }

                const distance = Math.sqrt(
                  Math.pow(mouseX - clampedX, 2) + Math.pow(mouseY - clampedY, 2)
                );

                if (distance < 50 && distance) {
                  nearestCard = card;
                  nearestPoint = { x: clampedX, y: clampedY };
                }
              });

              return { ...conn, endPoint: nearestCard ? nearestPoint : { x: mouseX, y: mouseY } };
            }
          }
          return conn;
        })
      );
    };

    const handleMouseUp = async (e: MouseEvent) => {
      console.log("draggingConnectionRef:", draggingConnectionRef.current);
      if (draggingConnectionRef.current) {
        const { connectionId, type } = draggingConnectionRef.current;
        const updatedConnection = localConnections.find((conn) => conn.id === connectionId);

        if (updatedConnection) {
          try {
            await updateConnection(_id, connectionId, {
              ...(type === 'start' ? { startOffset: updatedConnection.startOffset } : {}),
              ...(type === 'end' ? { endPoint: updatedConnection.endPoint } : {}),
            });
            console.log("updatedConnection:", updatedConnection);
            setLocalConnections((prevConnections) =>
              prevConnections.map((conn) =>
                conn.id === connectionId ? { ...conn, ...updatedConnection } : conn
              )
            );
            //window.location.reload();



            console.log('Connection updated successfully');
          } catch (error) {
            console.error('Failed to update connection:', error);
          }
        }

        draggingConnectionRef.current = null; // 重置 ref
        setDraggingConnection(null); // 同步重置 state
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [localConnections, _id, allCards]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!activeConnection) return;

      const mouseX = e.clientX;
      const mouseY = e.clientY;

      let nearestCard = null;
      let nearestPoint: { x: number; y: number } = { x: mouseX, y: mouseY }; // 默認為滑鼠位置
      let minDistance = Infinity; // 初始化最小距離為無限大

      // 遍歷所有卡片
      allCards.forEach((card) => {
        if (card._id === _id) return; // 跳過當前卡片

        // 獲取卡片的邊界資訊
        const rect = {
          top: card.position.y,
          bottom: card.position.y + card.dimensions.height,
          left: card.position.x,
          right: card.position.x + card.dimensions.width,
        };

        // 檢查滑鼠是否在卡片內部
        const isInsideCard =
          mouseX > rect.left &&
          mouseX < rect.right &&
          mouseY > rect.top &&
          mouseY < rect.bottom;

        let clampedX = mouseX;
        let clampedY = mouseY;

        if (isInsideCard) {
          // 如果滑鼠在卡片內部，將其校正到最近的邊界
          const isCloserToVerticalEdge =
            Math.min(Math.abs(mouseX - rect.left), Math.abs(mouseX - rect.right)) <
            Math.min(Math.abs(mouseY - rect.top), Math.abs(mouseY - rect.bottom));

          if (isCloserToVerticalEdge) {
            // 靠近左或右邊
            clampedX = mouseX < rect.left + (rect.right - rect.left) / 2 ? rect.left : rect.right;
            clampedY = Math.max(rect.top, Math.min(mouseY, rect.bottom)); // 固定在垂直邊界
          } else {
            // 靠近上或下邊
            clampedY = mouseY < rect.top + (rect.bottom - rect.top) / 2 ? rect.top : rect.bottom;
            clampedX = Math.max(rect.left, Math.min(mouseX, rect.right)); // 固定在水平邊界
          }
        } else {
          // 如果滑鼠在卡片外部，允許滑鼠點保持不變
          clampedX = Math.max(rect.left, Math.min(mouseX, rect.right));
          clampedY = Math.max(rect.top, Math.min(mouseY, rect.bottom));
        }

        // 計算滑鼠到卡片邊界的距離
        const distance = Math.sqrt(
          Math.pow(mouseX - clampedX, 2) + Math.pow(mouseY - clampedY, 2)
        );

        // 如果距離小於閾值且小於當前最小距離，更新最近卡片
        if (distance < 50 && distance < minDistance) {
          minDistance = distance;
          nearestCard = card;

          // 這裡修正：僅當滑鼠在內部時，才將最近點固定在卡片邊界
          nearestPoint = isInsideCard
            ? { x: clampedX, y: clampedY } // 停留在卡片邊界
            : { x: mouseX, y: mouseY }; // 保持滑鼠的位置
        }
      });

      // 更新 activeConnection 的終點位置
      if (nearestCard) {
        setActiveConnection((prev) =>
          prev
            ? {
              ...prev,
              endPoint: nearestPoint, // 嚴格校正到邊界點
            }
            : null
        );
      } else {
        setActiveConnection((prev) =>
          prev
            ? {
              ...prev,
              endPoint: { x: mouseX, y: mouseY }, // 繼續跟隨滑鼠
            }
            : null
        );
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [activeConnection, allCards, _id]);


  const activeConnection_handleMouseUp = async () => {
    if (!activeConnection) {
      // 如果 activeConnection 為 null，直接返回
      console.warn("activeConnection is null, cannot complete connection.");
      return;
    }

    const { startPoint, endPoint } = activeConnection;

    // 创建新连接对象
    const newConnection = {
      id: uuidv4(),
      startCardId: _id,
      startOffset: {
        x: startPoint.x - position.x,
        y: startPoint.y - position.y,
      },
      endPoint,
    };

    try {
      // 将连接保存到后端
      await addConnection(_id, newConnection);
      setLocalConnections((prevConnections) => [...prevConnections, newConnection]);

      console.log("Connection saved:", newConnection);
    } catch (error) {
      console.error("Failed to save connection:", error);
      toast.error("無法保存連線");
    }

    // 清空 activeConnection 状态
    setActiveConnection(null);
  };
  useEffect(() => {
    window.addEventListener('mouseup', activeConnection_handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', activeConnection_handleMouseUp);
    };
  }, [activeConnection, position]);

  // Function to save edited content and update the card  
  const handleSave = useCallback(() => {
    if (_id) {
      const changes: Partial<CardData> = {
        cardTitle: editedTitle,
        content: editedContent,
        dimensions: localDimensions,
        position: localPosition,
        //connection: connection,
        //connectionBy: connectionBy,
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
      toast.success('卡片已儲存');
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
  }, [_id, onDelete]);

  const handleDeleteConnection = useCallback(async () => {
    if (!selectedConnectionId || !_id) return; // 如果沒有選中的連線或卡片 ID，直接返回

    try {
      // 調用後端刪除連線 API
      //console.log("MKMKMKKhandleDeleteConnection:",_id, selectedConnectionId)
      await deleteConnection(_id, selectedConnectionId);

      setLocalConnections((prevConnections) =>
        prevConnections.filter((connection) => connection.id !== selectedConnectionId)
      );
      onDeleteConnection?.(selectedConnectionId);
      // 更新本地 connections 狀態
      // 清除選中狀態
      setSelectedConnectionId(null);
      console.log(`Connection ${selectedConnectionId} deleted.`);
    } catch (error) {
      console.error(`Failed to delete connection: ${selectedConnectionId}`, error);
      alert('Failed to delete connection.');
    }
  }, [selectedConnectionId, _id, setSelectedConnectionId]);
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
            const fullHeight = (editor as HTMLElement).scrollHeight + (titleRef.current?.offsetHeight || 0) + 24;
            const updatedHeight = Math.min(Math.max(fullHeight, MIN_HEIGHT), MAX_HEIGHT);
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



  // Resize handler to update dimensions and position
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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 檢查是否按下 Ctrl+C 或 Cmd+C
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault(); // 阻止默認行為（例如，複製到剪貼簿）
        if (isSelected) {
          onCopyCard({
            _id,
            cardTitle,
            content,
            dueDate,
            tag,
            foldOrNot,
            position,
            dimensions,
            comments,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          console.log('Card copied:', _id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSelected, _id, cardTitle, content, dueDate, tag, foldOrNot, position, dimensions, comments, onCopyCard]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete') {
        //const userConfirmed = window.confirm("你確定要刪除連結嗎?");
        // if (userConfirmed) {
        handleDeleteConnection(); // 調用刪除函數
        // }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedConnectionId, _id]);
  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  return (
    <div
    >
      {/* SVG for connections */}
      <svg
        className="connections-layer"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: selectedConnectionId ? 'auto' : 'none', // 動態切換 如果你點擊了line 你就不能drag card了
          zIndex: 10,
        }}
        onClick={() => {
          if (selectedConnectionId) setSelectedConnectionId(null);
        }}
      >
        {localConnections.map((connection) => {
          if (connection.endPoint) {
            const startPoint = {
              x: localPosition.x + connection.startOffset.x,
              y: localPosition.y + connection.startOffset.y,
            };
            const { endPoint } = connection;

            return (
              <React.Fragment key={connection.id}>
                <line
                  x1={startPoint.x}
                  y1={startPoint.y}
                  x2={endPoint.x}
                  y2={endPoint.y}
                  stroke="transparent" // 透明
                  strokeWidth={10} // 點擊區域寬度
                  style={{ pointerEvents: 'stroke' }} // 讓點擊事件觸發在 stroke 上
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedConnectionId(connection.id);
                    onSelect(null);
                  }}
                />

                {/* 可見的細線 */}
                <line
                  x1={startPoint.x}
                  y1={startPoint.y}
                  x2={endPoint.x}
                  y2={endPoint.y}
                  stroke={selectedConnectionId === connection.id ? 'blue' : 'black'}
                  strokeWidth={3} // 可見的細線寬度
                />
                {/* 只有當前連線被選中時，渲染藍點 */}
                {selectedConnectionId === connection.id && (
                  <>
                    {/* 起點 */}
                    <circle
                      cx={startPoint.x}
                      cy={startPoint.y}
                      r={5}
                      fill="blue"
                      cursor="pointer"
                      onMouseDown={(e) => {
                        const direction: 'start' | 'end' = 'start';
                        const connectionData = { connectionId: connection.id, type: direction }; // 構造新的 draggingConnection
                        setDraggingConnection(connectionData); // 更新 state
                        draggingConnectionRef.current = connectionData; // 更新 ref
                      }}
                    />
                    {/* 終點 */}
                    <circle
                      cx={endPoint.x}
                      cy={endPoint.y}
                      r={5}
                      fill="blue"
                      cursor="pointer"
                      onMouseDown={(e) => {
                        const direction: 'start' | 'end' = 'end';
                        const connectionData = { connectionId: connection.id, type: direction }; // 構造新的 draggingConnection
                        setDraggingConnection(connectionData); // 更新 state
                        draggingConnectionRef.current = connectionData; // 更新 ref
                      }}
                    />
                  </>
                )}
              </React.Fragment>
            );
          }
          return null;
        })}
      </svg>
      {activeConnection && (
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 11,
          }}
        >
          <line
            x1={activeConnection.startPoint.x}
            y1={activeConnection.startPoint.y}
            x2={activeConnection.endPoint.x}
            y2={activeConnection.endPoint.y}
            stroke="black"
            strokeWidth="5"
          />
        </svg>
      )}
      <Rnd
        size={isFullscreen ? { width: '100vw', height: '100vh' } : localDimensions}
        position={isFullscreen ? { x: 0, y: 0 } : localPosition}
        onDragStop={(e, d) => {
          if (!isFullscreen) { // Only handle drag stop if not fullscreen
            console.log("d.x,d.y", d);
            const newPosition = { x: d.x, y: d.y };
            handleResize({ width: localDimensions.width, height: localDimensions.height }, newPosition);
            setCards(prevCards => {
              return prevCards.map(card => {
                if (card._id === _id) {
                  return { ...card, position: newPosition,dimensions:localDimensions }; // 同步父層狀態
                }
                return card;
              });
            });
            setLocalPosition(newPosition);
            // 通知父元件  卡片位置更新
            onPositionChange?.(_id, newPosition);
            handleResize({ width: localDimensions.width, height: localDimensions.height }, { x: d.x, y: d.y });
          }
          //handleSave()
        }}
        onDrag={(e, d) => {
          if (!isFullscreen) {
            const newPosition = { x: d.x, y: d.y };
            setLocalPosition(newPosition);

            // 實時通知父元件位置變更
            onPositionChange?.(_id, newPosition);
          }
        }}
        onResize={(e, direction, ref, delta, position) => {
          if (isFullscreen) return;
          const newWidth = Math.max(parseInt(ref.style.width, 10), MIN_WIDTH);
          const newHeight = Math.max(parseInt(ref.style.height, 10), MIN_HEIGHT);
          setLocalDimensions({
            width: newWidth,
            height: newHeight,
          });
          setLocalPosition(position);
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          
          if (isFullscreen) return;
          handleResize(
            {
              width: Math.max(parseInt(ref.style.width, 10), MIN_WIDTH),
              height: Math.max(parseInt(ref.style.height, 10), MIN_HEIGHT),
            },
            position
          );
        }}
        bounds={'window'}
        enableResizing={
          isFullscreen
            ? false
            : {
              top: !isEditing,
              right: true,
              bottom: !isEditing,
              left: true,
              topRight: !isEditing,
              bottomRight: !isEditing,
              bottomLeft: !isEditing,
              topLeft: !isEditing,
            }
        }
        disableDragging={isEditing} // Disable dragging when editing
        onContextMenu={(e: any) => {
          e.stopPropagation();
          onRightClick?.(e, _id);
        }}
        minHeight={MIN_HEIGHT}
        minWidth={MIN_WIDTH}
        maxHeight={isFullscreen ? '100vh' : MAX_HEIGHT}
        maxWidth={isFullscreen ? '100vw' : MAX_WIDTH}
        className={`${isSelected ? 'ring-4 ring-[#A15C38]' : ''
          } ${isFullscreen ? 'fullscreen-card' : 'z-60'}`}
        style={isFullscreen ? { position: 'fixed', top: 0, left: 0, zIndex: 9999 } : {}}
      >
        <div
          className={`card-content bg-[#F7F1F0] border border-[#C3A6A0] p-6 rounded-xl shadow-lg relative flex flex-col ${isEditing ? '' : 'select-none'
            } ${isFullscreen ? 'fullscreen-content' : ''}`}
          onDoubleClick={() => setIsEditing(true)}
          onClick={(e) => {
            console.log("position:", position);
            e.stopPropagation(); // 阻止冒泡到父容器
            onSelect(_id); // 選中當前卡片
          }}
          ref={cardRef}
          style={{ boxSizing: 'border-box', overflow: 'visible' }}
        >
          {/* Header with fixed buttons and title */}
          <div className="header flex-none">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                {!isFullscreen && (
                  <>
                    {/* Fold button */}
                    <button
                      onClick={handleToggleFold}
                      className="text-[#A15C38] hover:text-[#8B4C34] focus:outline-none text-xl"
                      title={isFolded ? '展開卡片' : '摺疊卡片'}
                    >
                      {/* {isFolded ? '+' : '-'} */}
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
                          comments,
                          createdAt: new Date(),
                          updatedAt: new Date(),
                        });
                      }}
                      className="text-[#A15C38] hover:text-[#8B4C34] focus:outline-none text-xl"
                      title="複製卡片"
                    >
                      📄
                    </button>
                  </>
                )}

                {/* Fullscreen button */}
                <button
                  onClick={toggleFullscreen}
                  className="text-[#A15C38] hover:text-[#8B4C34] focus:outline-none text-xl"
                  title="全螢幕"
                >
                  {isFullscreen ? '離開全螢幕' : '🖥️'}
                </button>
              </div>

              {/* Delete button */}
              <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 focus:outline-none text-xl"
                title="刪除卡片"
              >
                🗑️
              </button>
            </div>

            {isSelected && (
              <>
                {/* 上方圓點 */}
                <div
                  onClick={() => console.log('Clicked on top point')}
                  onMouseDown={(e) => handleStartConnectionMouseDown(e, 'top')}
                  style={{
                    position: 'absolute',
                    top: '-20px', // 偏移卡片範圍
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: 'blue',
                  }}
                ></div>
                {/* 下方圓點 */}
                <div
                  onClick={() => console.log('Clicked on bottom point')}
                  onMouseDown={(e) => handleStartConnectionMouseDown(e, 'bottom')}
                  style={{
                    position: 'absolute',
                    bottom: '-20px', // 偏移卡片範圍
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: 'blue',
                  }}
                ></div>
                {/* 左側圓點 */}
                <div
                  onClick={() => console.log('Clicked on left point')}
                  onMouseDown={(e) => handleStartConnectionMouseDown(e, 'left')}
                  style={{
                    position: 'absolute',
                    left: '-20px', // 偏移卡片範圍
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: 'blue',
                  }}
                ></div>
                {/* 右側圓點 */}
                <div
                  onClick={() => console.log('Clicked on right point')}
                  onMouseDown={(e) => handleStartConnectionMouseDown(e, 'right')}
                  style={{
                    position: 'absolute',
                    right: '-20px', // 偏移卡片範圍
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: 'blue',
                  }}
                ></div>
              </>
            )}
            {/* Tag Component */}
            <div className="mb-4">
              <Tag currentTag={tag} onUpdateTag={handleTagUpdate} />
            </div>

            {/* Header with title and save button */}
            {isEditing && (
              <div className="flex justify-between items-center mb-4 writing-mode-horizontal">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-[#C3A6A0] rounded text-[#262220] focus:outline-none focus:ring-2 focus:ring-[#A15C38]"
                  placeholder="輸入卡片標題"
                />

                <button
                  onClick={handleSave}
                  className="ml-3 px-4 py-2 bg-[#A15C38] text-white rounded-lg hover:bg-[#8B4C34] focus:outline-none transition duration-200 shadow-md writing-mode-horizontal whitespace-nowrap"
                >
                  儲存
                </button>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-grow ">
            {isEditing ? (
              <div className="flex flex-col select-text">
                {!isFolded && (
                  <QuillEditor
                    content={editedContent}
                    handleContentChange2={handleContentChange}
                    readOnly={false}
                    theme="bubble"
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col">
                <h3
                  ref={titleRef}
                  className="text-xl font-serif font-bold text-[#262220] mt-2"
                >
                  {cardTitle}
                </h3>
                {!isFolded && (
                  <div className="mt-4">
                    <QuillEditor
                      content={content}
                      handleContentChange2={() => { }}
                      readOnly={true}
                      theme="bubble"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Rnd>
    </div>
  );

});

export default Card;
