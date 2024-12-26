// routes/index.tsx - Defines the routing configuration for the application

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import Map from '@/pages/Map';
import WhiteboardRoute from '@/pages/Whiteboard/WhiteboardRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Login/Register';
import ResetPassword from '@/pages/Login/ResetPassword';
import Management from '@/pages/Management';
import { UserProvider } from '@/contexts/UserContext';

// AppRoutes component defines the routing configuration for the application
const AppRoutes: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/map/:userName" element={<Map />} />
          <Route path="/whiteboard/:id" element={<WhiteboardRoute />} />
          <Route path="/management/:userName" element={<Management />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default AppRoutes;
