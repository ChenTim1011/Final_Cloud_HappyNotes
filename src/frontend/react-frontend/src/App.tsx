// src/App.tsx

import React, { useState, useEffect, useCallback } from 'react';
import AppRoutes from './routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import { CardData } from '@/interfaces/Card/CardData';
import { getAllCards } from '@/services/cardService';

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
    <div>   
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
    </div>
  );
}

export default App;
