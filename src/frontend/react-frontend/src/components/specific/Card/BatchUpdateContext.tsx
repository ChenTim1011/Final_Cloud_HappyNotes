// src/components/specific/Card/BatchUpdateContext.tsx

import React, { createContext, useContext, useRef, useEffect, useCallback } from 'react';
import { patchCardsBatch } from '@/services/cardService';
import { CardData } from '@/interfaces/Card/CardData';
import { toast, ToastOptions } from 'react-toastify';

interface BatchUpdateContextProps {
    addCardUpdate: (id: string, changes: Partial<CardData>) => void;
}

const BatchUpdateContext = createContext<BatchUpdateContextProps | undefined>(undefined);

interface BatchUpdateProviderProps {
    children: React.ReactNode;
    cards: CardData[];
    setCards: React.Dispatch<React.SetStateAction<CardData[]>>;
    refreshCards: () => void;
}

const MAX_BATCH_SIZE = 50; 
const BATCH_INTERVAL = 5000; 
const MAX_DELAY = 30000; 
const MAX_RETRIES = 3; 

export const BatchUpdateProvider: React.FC<BatchUpdateProviderProps> = ({ children, cards, setCards, refreshCards }) => {
    // Use Map to store updates
    const updatesRef = useRef<Map<string, Partial<CardData>>>(new Map());
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const maxDelayTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isProcessingRef = useRef<boolean>(false);
    const retryCountRef = useRef<number>(0);
    const currentBackoffRef = useRef<number>(1000); // Backoff time in ms

   
    const retryProcessBatch = useCallback(() => {
        processBatch();
    }, []);

    
    const processBatch = useCallback(async () => {
        if (updatesRef.current.size === 0 || isProcessingRef.current) {
            return;
        }

        isProcessingRef.current = true;

        // Convert Map to array of updates
        const updatesToSend = Array.from(updatesRef.current.entries()).map(([id, changes]) => ({
            id,
            changes,
        }));

        updatesRef.current.clear(); 

        try {
            // Batch updates in chunks of MAX_BATCH_SIZE
            for (let i = 0; i < updatesToSend.length; i += MAX_BATCH_SIZE) {
                const batch = updatesToSend.slice(i, i + MAX_BATCH_SIZE);
                

                
                await patchCardsBatch(batch);
            }

            // Update local cards with new data
            await refreshCards();

            
            //toast.success('批次更新成功！');

            // Reset retry count and backoff time
            retryCountRef.current = 0;
            currentBackoffRef.current = 1000;
        } catch (error) {
            console.error('Batch update failed:', error);

            if (retryCountRef.current < MAX_RETRIES) {
                
                retryCountRef.current += 1;

                
                currentBackoffRef.current *= 2;

                
                toast.error(
                    <div>
                        批次更新失敗。<button onClick={retryProcessBatch} className="text-blue-500 underline">重試</button>
                    </div>,
                    {
                        autoClose: false,
                    } as ToastOptions
                );

                // Set a timer to retry the batch update
                timerRef.current = setTimeout(() => {
                    processBatch();
                    timerRef.current = null;
                }, currentBackoffRef.current);
            } else {
                console.error('Batch update failed multiple times. Please check your network or backend service.');
                // Show error message with retry button
                toast.error(
                    <div>
                        批次更新失敗。請檢查您的網路或稍後再試。<button onClick={retryProcessBatch} className="text-blue-500 underline">重試</button>
                    </div>,
                    {
                        autoClose: false,
                    } as ToastOptions
                );

                // Reset retry count and backoff time
                retryCountRef.current = 0;
                currentBackoffRef.current = 1000;
            }

            
            await refreshCards();
        } finally {
            isProcessingRef.current = false;
            // Clear max delay timer if it exists
            if (maxDelayTimerRef.current) {
                clearTimeout(maxDelayTimerRef.current);
                maxDelayTimerRef.current = null;
            }
        }
    }, [refreshCards, retryProcessBatch]);

    // Add a content update to the batch
    const addCardUpdate = useCallback((id: string, changes: Partial<CardData>) => {
        if (!id) {
            console.warn(`Invalid card ID, ignoring update.`);
            return;
        }

        // Use Map to store updates
        setCards(prevCards =>
            prevCards.map(card =>
                card._id === id
                    ? { ...card, ...changes }
                    : card
            )
        );

        updatesRef.current.set(id, { ...updatesRef.current.get(id), ...changes });

        // Set a timer to process the batch updates
        if (!maxDelayTimerRef.current) {
            console.log('Setting max delay timer for batch processing.');
            maxDelayTimerRef.current = setTimeout(() => {
                processBatch();
                maxDelayTimerRef.current = null;
            }, MAX_DELAY);
        }

        // Clear existing batch interval timer
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
            processBatch();
            timerRef.current = null;
        }, BATCH_INTERVAL);
    }, [processBatch, setCards]);

    // Cleanup timers on unmount
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (updatesRef.current.size > 0) {
                processBatch();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            if (maxDelayTimerRef.current) {
                clearTimeout(maxDelayTimerRef.current);
            }
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [processBatch]);

    return (
        <BatchUpdateContext.Provider value={{ addCardUpdate }}>
            {children}
        </BatchUpdateContext.Provider>
    );
};

export const useBatchUpdate = (): BatchUpdateContextProps => {
    const context = useContext(BatchUpdateContext);
    if (!context) {
        throw new Error("useBatchUpdate must be used within a BatchUpdateProvider");
    }
    return context;
};
