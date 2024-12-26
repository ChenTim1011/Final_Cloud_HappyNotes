// src/contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserData } from '@/interfaces/User/UserData';

interface UserContextType {
  currentUser: UserData | null;
  setCurrentUser: (user: UserData | null) => void;
  userLoading: boolean; 
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<UserData | null>(null);
  const [userLoading, setUserLoading] = useState(true); 
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser: UserData = JSON.parse(storedUser);
        setCurrentUserState(parsedUser);
      } catch (err) {
        console.error('Failed to parse user from localStorage:', err);
      }
    }
    // Set userLoading to false after checking localStorage
    setUserLoading(false);
  }, []);

  const setCurrentUser = useCallback((user: UserData | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, userLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
