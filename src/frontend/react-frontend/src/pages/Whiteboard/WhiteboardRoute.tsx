// src/pages/WhiteboardRoute.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { BatchUpdateProvider } from '@/components/specific/Card/BatchUpdateContext';
import { CardData } from '@/interfaces/Card/CardData';
import { getAllCards } from '@/services/cardService';
import Whiteboard from '.'; 

const WhiteboardRoute: React.FC = () => {
  const [cards, setCards] = useState<CardData[]>([]);

  
  const refreshCards = useCallback(async () => {
    try {
      const fetchedCards = await getAllCards();
      setCards(fetchedCards);
    } catch (error) {
      console.error('Failed to fetch cards:', error);
    }
  }, []);

  useEffect(() => {
    refreshCards();
  }, [refreshCards]);

  return (
    <BatchUpdateProvider 
      cards={cards}
      setCards={setCards}
      refreshCards={refreshCards}
    >
      <Whiteboard />
    </BatchUpdateProvider>
  );
};

export default WhiteboardRoute;
