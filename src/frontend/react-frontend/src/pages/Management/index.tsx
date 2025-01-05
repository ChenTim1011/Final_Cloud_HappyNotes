// src/pages/Management/index.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import Sidebar from '@/components/common/sidebar';
import { CardData } from '@/interfaces/Card/CardData';
import Card from '@/components/specific/Management/Card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Search, Clock, Calendar, Plus } from 'lucide-react'; 
import { getAllWhiteboards } from '@/services/whiteboardService';
import { getAllCards, deleteCard, createCard, updateCard, createCardWithWhiteboard } from '@/services/cardService';
import { WhiteboardData } from '@/interfaces/Whiteboard/WhiteboardData';
import { toast } from 'react-toastify';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { getUserFromToken } from '@/services/loginService';
import { UserData } from '@/interfaces/User/UserData'; 
import FullscreenEdit from '@/components/specific/Management/FullscreenEdit';
import DOMPurify from 'dompurify'; 

const ITEMS_PER_PAGE = 16; // Number of cards displayed per page
const MAX_VISIBLE_PAGES = 5; // Maximum number of pages to display in pagination
const ALL_VALUE = "all"; // Value for the "All" option
const DEBOUNCE_DELAY = 500; // Debounce delay time in milliseconds

const Management: React.FC = () => {
    const { userName } = useParams<{ userName: string }>();
    const navigate = useNavigate(); // Initialize navigate
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(''); // New state for debounced search query
    const [whiteboards, setWhiteboards] = useState<WhiteboardData[]>([]);
    const [cards, setCards] = useState<CardData[]>([]);
    const [filteredCards, setFilteredCards] = useState<CardData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTag, setSelectedTag] = useState(ALL_VALUE);
    const [selectedWhiteboard, setSelectedWhiteboard] = useState(ALL_VALUE);
    const [sortBy, setSortBy] = useState<'updatedAt' | 'createdAt'>('updatedAt');
    const [userId, setUserId] = useState<string | null>(null);
    const [userError, setUserError] = useState<string | null>(null);
    const [allTags, setAllTags] = useState<string[]>([]); // New state to store all unique tags
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);

    // 1. Get current user data using getUserFromToken and implement access control
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const user = await getUserFromToken();
                setCurrentUser(user);
                setUserId(user._id);

                // Access Control: Check if the userName in URL matches the current user's userName
                if (userName && user.userName !== userName) {
                    toast.error('您沒有權限存取此管理頁面');
                    navigate(`/management/${user.userName}`); // Redirect to the correct Management page
                }
            } catch (error) {
                console.error('Failed to fetch current user:', error);
                setUserError('請先登入。');
                navigate('/auth/login'); // Redirect to login if not authenticated
            }
        };

        fetchCurrentUser();
    }, [navigate, userName]);

    // 2. Fetch whiteboards based on userId and ensure cards are populated
    useEffect(() => {
        const fetchWhiteboards = async () => {
            if (!userId) {
                if (!userError) {
                    // Waiting for userId to be set
                    return;
                }
                // If there's an error, stop loading
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                // Pass userId to fetch only the user's whiteboards from the backend
                const fetchedWhiteboards: WhiteboardData[] = await getAllWhiteboards(userId);

                //console.log("Fetched Whiteboards (Populated):", fetchedWhiteboards); // Check user whiteboard data

                setWhiteboards(fetchedWhiteboards);

                // Update cards state with all cards from the whiteboards
                const userCards = fetchedWhiteboards.flatMap(wb => wb.cards);
                setCards(userCards);
            } catch (error) {
                console.error('Failed to fetch whiteboards or cards:', error);
                toast.error('Failed to load whiteboards or cards');
            } finally {
                setIsLoading(false);
            }
        };

        if (userId) {
            fetchWhiteboards();
        }
    }, [userId, userError]);

    // 3. Extract all unique tags based on whiteboard data
    useEffect(() => {
        const fetchTags = async () => {
            if (whiteboards.length === 0) {
                setAllTags([]);
                return;
            }

            try {
                // Extract all tags from cards
                const uniqueTags = Array.from(
                    new Set(cards.map(card => card.tag).filter((tag): tag is string => !!tag))
                );
                setAllTags(uniqueTags);
            } catch (error) {
                console.error('Failed to fetch tags:', error);
                toast.error('Failed to load tags');
            }
        };

        fetchTags();
    }, [cards, whiteboards]);

    // 4. Debounce handling for search query
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, DEBOUNCE_DELAY);

        // Clear the timeout
        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    /**
     * 5. Filter and sort cards
     *    - Whiteboard Filter
     *    - Tag Filter
     *    - Search Filter (Card Title / Content)
     *    - Sort (updatedAt / createdAt)
     */
    useEffect(() => {
        let filtered = [...cards];

        // (A) Whiteboard Filter
        if (selectedWhiteboard !== ALL_VALUE) {
            // Find the selected whiteboard
            const targetWhiteboard = whiteboards.find(wb => wb._id === selectedWhiteboard);
            if (targetWhiteboard) {
                // Get the IDs of cards under the selected whiteboard
                const wbCardIds = targetWhiteboard.cards.map(c => c._id);
                // Only keep cards that belong to the selected whiteboard
                filtered = filtered.filter(card => wbCardIds.includes(card._id));
            } else {
                // If not found unexpectedly, set to empty
                filtered = [];
            }
        }

        // (B) Tag Filter
        if (selectedTag !== ALL_VALUE) {
            filtered = filtered.filter(card => card.tag === selectedTag);
        }

        // (C) Search Filter
        if (debouncedSearchQuery) {
            filtered = filtered.filter(card => 
                card.cardTitle.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                String(card.content).toLowerCase().includes(debouncedSearchQuery.toLowerCase())
            );
        }

        // (D) Sort (by updatedAt or createdAt)
        filtered.sort((a, b) => {
            const dateA = new Date(sortBy === 'updatedAt' ? a.updatedAt : a.createdAt);
            const dateB = new Date(sortBy === 'updatedAt' ? b.updatedAt : b.createdAt);
            return dateB.getTime() - dateA.getTime();
        });

        //console.log("Filtered Cards:", filtered); // Check filtered results
        setFilteredCards(filtered);
        setCurrentPage(1);
    }, [
        cards,
        whiteboards,
        selectedWhiteboard,
        selectedTag,
        debouncedSearchQuery,
        sortBy
    ]);

    // 6. Calculate tags and their counts
    const tagCounts = cards.reduce((acc, card) => {
        if (card.tag) {
            acc[card.tag] = (acc[card.tag] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    // 7. Pagination calculations
    const paginatedCards = filteredCards.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
    const totalPages = Math.ceil(filteredCards.length / ITEMS_PER_PAGE);

    const getPageNumbers = (currentPage: number, totalPages: number) => {
        if (totalPages <= MAX_VISIBLE_PAGES) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        if (currentPage <= 3) {
            return [1, 2, 3, 4, 5];
        }
        if (currentPage >= totalPages - 2) {
            return Array.from({ length: 5 }, (_, i) => totalPages - 4 + i);
        }
        return [
            currentPage - 2,
            currentPage - 1,
            currentPage,
            currentPage + 1,
            currentPage + 2,
        ];
    };

    // 8. Handle card updates
    const handleCardUpdate = useCallback(async (updatedCard: CardData) => {
        try {
            await updateCard(updatedCard._id, updatedCard);
            // Update local state
            setCards(prevCards => prevCards.map(card => card._id === updatedCard._id ? updatedCard : card));
            // Update cards in whiteboards
            setWhiteboards(prevWhiteboards => prevWhiteboards.map(wb => ({
                ...wb,
                cards: wb.cards.map(card => card._id === updatedCard._id ? updatedCard : card)
            })));
            toast.success('卡片更新成功');
        } catch (error) {
            console.error('Failed to update card:', error);
            toast.error('卡片更新失敗');
        }
    }, []);

    // 9. Handle card deletion
    const deleteCardHandler = useCallback(async (cardId: string) => {
        try {
            await deleteCard(cardId);
            // Remove card from state
            setCards(prevCards => prevCards.filter(card => card._id !== cardId));
            // Remove card from whiteboards
            setWhiteboards(prevWhiteboards => 
                prevWhiteboards.map(wb => ({
                    ...wb,
                    cards: wb.cards.filter(card => card._id !== cardId)
                }))
            );
            toast.success('卡片已刪除');
        } catch (error) {
            console.error('Failed to delete card:', error);
            toast.error('卡片刪除失敗');
        }
    }, []);

    // 10. Handle card copying
    const handleCopyCard = useCallback(async (card: CardData) => {
        try {
            const newCardData: Omit<CardData, '_id'> = {
                cardTitle: `${card.cardTitle} (Copy)`,
                content: DOMPurify.sanitize(card.content), 
                dueDate: card.dueDate,
                tag: card.tag,
                foldOrNot: card.foldOrNot,
                position: { x: 0, y: 0 },
                dimensions: { width: 300, height: 200 },
                comments: card.comments,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const createdCard = await createCard(newCardData);
            

            setCards(prevCards => [...prevCards, createdCard]);

            // Insert the new card into the whiteboard that owns the original card
            setWhiteboards(prevWhiteboards => prevWhiteboards.map(wb => {
                if (wb.cards.some(c => c._id === card._id)) {
                    return {
                        ...wb,
                        cards: [...wb.cards, createdCard]
                    };
                }
                return wb;
            }));

            toast.success('卡片已複製');
        } catch (error) {
            console.error('複製卡片失敗：', error);
            toast.error('複製卡片失敗');
        }
    }, []);

    // 11. Handle card selection
    const handleSelectCard = (cardId: string) => {
        const card = cards.find(c => c._id === cardId);
        if (card) {
            setSelectedCard(card);
            setIsEditModalOpen(true);
        }
    };

    // 12. Handle modal save
    const handleModalSave = async () => {
        if (selectedCard) {
            await handleCardUpdate(selectedCard);
            setIsEditModalOpen(false);
        }
    };

    // 13. Handle adding a new card
    const handleAddCard = async () => {
        try {
            const newCardData: Omit<CardData, '_id'> = {
                cardTitle: '新卡片',
                content: '', 
                dueDate: undefined, 
                tag: '',
                foldOrNot: false,
                position: { x: 0, y: 0 },
                dimensions: { width: 300, height: 200 },
                connections: [],
                comments: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
    
            // Ensure there is at least one whiteboard
            let whiteboardId: string | null = null;
            if (selectedWhiteboard !== ALL_VALUE) {
                whiteboardId = selectedWhiteboard;
            } else if (whiteboards.length > 0) {
                whiteboardId = whiteboards[0]._id;
            }
            //console.log("Selected Whiteboard ID:", whiteboardId);
            if (!whiteboardId) {
                toast.error('請選擇一個白板');
                throw new Error('沒有選擇的白板，且白板列表為空');
            }

            // Clean the content using DOMPurify
            const sanitizedContent = DOMPurify.sanitize(newCardData.content);

            // Use the createCardWithWhiteboard function to create a card with the whiteboard ID
            const createdCard = await createCardWithWhiteboard(whiteboardId, {
                ...newCardData,
                content: sanitizedContent, 
            });
            //console.log("新建的卡片：", createdCard);

            setCards(prevCards => [...prevCards, createdCard]);

            setWhiteboards(prevWhiteboards => prevWhiteboards.map(wb => {
                if (wb._id === whiteboardId) {
                    return {
                        ...wb,
                        cards: [...wb.cards, createdCard] as CardData[] // Push the new card into the whiteboard's cards array
                    };
                }
                return wb;
            }));

            toast.success('卡片已新增');
        } catch (error: any) {
            console.error('新增卡片失敗：', error);
            toast.error(`新增卡片失敗：${error.message}`);
        }
    };


    // 14. Display loading or error messages
    if (userError) {
        return <div className="p-5 text-center text-red-500">{userError}</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#F7F1F0] to-[#C3A6A0]">
            {/* Sidebar with fixed position */}
            <div className="fixed top-[-20px] left-[-5px] h-screen w-64 z-50">
                <Sidebar currentUser={currentUser} setCurrentUser={setCurrentUser} />
            </div>

            {/* Header Bar */}
            <div className="fixed top-0 left-16 right-0 h-16 bg-white border-b border-[#C3A6A0] flex justify-center items-center px-4 z-10 shadow-md">
                <div className="flex items-center gap-6 max-w-7xl w-full">
                    {/* Search Input */}
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <Input
                            type="text"
                            placeholder="搜尋卡片..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-full border border-[#C3A6A0] rounded-lg focus:ring-2 focus:ring-[#A15C38]"
                        />
                    </div>

                    {/* Tag Filter */}
                    <Select value={selectedTag} onValueChange={setSelectedTag}>
                        <SelectTrigger className="w-40 border border-[#C3A6A0] rounded-lg focus:ring-2 focus:ring-[#A15C38]">
                            <SelectValue placeholder="篩選標籤" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL_VALUE}>所有標籤</SelectItem>
                            {allTags.map(tag => (
                                <SelectItem key={tag} value={tag}>
                                    {tag} ({tagCounts[tag] || 0})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Whiteboard Filter */}
                    <Select value={selectedWhiteboard} onValueChange={setSelectedWhiteboard}>
                        <SelectTrigger className="w-56 border border-[#C3A6A0] rounded-lg focus:ring-2 focus:ring-[#A15C38]">
                            <SelectValue placeholder="篩選白板" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL_VALUE}>所有白板</SelectItem>
                            {whiteboards
                                .filter(wb => wb.cards && wb.cards.length > 0)
                                .map(wb => (
                                    <SelectItem key={wb._id} value={wb._id}>
                                        <div className="flex justify-between items-center w-full">
                                            <span>{wb.whiteboardTitle}</span>
                                            <span className="text-gray-500 text-sm">({wb.cards.length} 卡片)</span>
                                        </div>
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>



                    {/* Sort Options */}
                    <Select value={sortBy} onValueChange={(value: 'updatedAt' | 'createdAt') => setSortBy(value)}>
                        <SelectTrigger className="w-40 border border-[#C3A6A0] rounded-lg focus:ring-2 focus:ring-[#A15C38]">
                            <SelectValue placeholder="排序方式" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="updatedAt">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} />
                                    最近更新
                                </div>
                            </SelectItem>
                            <SelectItem value="createdAt">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    建立時間
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Add new card button */}
                    <button
                        onClick={handleAddCard}
                        className="flex items-center gap-2 px-4 py-2 bg-[#A15C38] text-white rounded-lg hover:bg-[#8B4C34] transition duration-200 focus:outline-none shadow-md"
                    >
                        <Plus size={16} /> 新增卡片
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="mt-20 ml-16 p-8">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <span className="text-gray-500 text-lg">載入中...</span>
                    </div>
                ) : (
                    <>
                        {filteredCards.length === 0 ? (
                            <div className="flex justify-center items-center h-64">
                                <span className="text-gray-500 text-lg">找不到卡片。</span>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-4 grid-rows-4 gap-6 max-w-7xl mx-auto">
                                    {paginatedCards.map((card) => (
                                        <Card
                                            key={card._id}
                                            {...card}
                                            onDelete={deleteCardHandler}
                                            isSelected={selectedCard?._id === card._id}
                                            onSelect={handleSelectCard}
                                            onCopyCard={handleCopyCard}
                                        />
                                    ))}

                                    {/* Fill empty spaces to maintain a fixed 4x4 grid */}
                                    {paginatedCards.length < ITEMS_PER_PAGE &&
                                        Array.from({ length: ITEMS_PER_PAGE - paginatedCards.length }).map((_, index) => (
                                            <div key={`empty-${index}`} className="invisible"></div>
                                        ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-8 flex justify-center">
                                        <Pagination>
                                            <PaginationContent>
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                                    />
                                                </PaginationItem>

                                                {getPageNumbers(currentPage, totalPages).map((pageNum) => (
                                                    <PaginationItem key={pageNum}>
                                                        <PaginationLink
                                                            onClick={() => setCurrentPage(pageNum)}
                                                            isActive={currentPage === pageNum}
                                                            className="cursor-pointer"
                                                        >
                                                            {pageNum}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                ))}

                                                {currentPage < totalPages - 2 && (
                                                    <PaginationItem>
                                                        <PaginationEllipsis />
                                                    </PaginationItem>
                                                )}

                                                <PaginationItem>
                                                    <PaginationNext
                                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Fullscreen Edit Overlay */}
            {isEditModalOpen && selectedCard && (
                <FullscreenEdit
                    card={selectedCard}
                    onChange={(updatedFields) => setSelectedCard({ ...selectedCard, ...updatedFields })}
                    onSave={handleModalSave}
                    onCancel={() => setIsEditModalOpen(false)}
                />
            )}
        </div>
    );

};

export default Management;
