// src/App.tsx

import React, { useState, useEffect, useCallback } from 'react';
import AppRoutes from './routes';
import { BatchUpdateProvider } from '@/components/specific/Card/BatchUpdateContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import { CardData } from '@/interfaces/Card/CardData';
import { getAllCards } from '@/services/cardService';
import { UserProvider } from '@/contexts/UserContext';

function App() {
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
      <UserProvider>
      <AppRoutes />
      <ToastContainer 
        position="top-right" 
        autoClose={5000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
      />
      </UserProvider>
  );
}

export default App;
