// src/App.tsx

import React, { useState, useEffect, useCallback } from 'react';
import AppRoutes from './routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import { CardData } from '@/interfaces/Card/CardData';
import { getAllCards } from '@/services/cardService';
import { UserProvider } from '@/contexts/UserContext';
import useAuth from '@/hooks/useAuth'; 
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
      {/* 傳遞認證相關的props給AppRoutes */}
      <AppRoutes />
      {/* Toast通知容器 */}
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
