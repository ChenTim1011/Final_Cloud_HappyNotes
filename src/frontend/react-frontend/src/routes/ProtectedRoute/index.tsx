// routes/ProtectedRoute/index.tsx - Ensures protected routes are accessible only to authenticated users, 
// with token validation and refresh handling.

import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { validateToken, refreshAccessToken } from '../../services/loginService';

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { userName } = useParams();

    useEffect(() => {
        const token = sessionStorage.getItem('accessToken');
        const refreshToken = sessionStorage.getItem('refreshToken');

        const validateOrRefreshToken = async () => {
            try {
                if (!token || !userName) {
                    throw new Error("Missing token or userName");
                }

                // Validate the current token
                const isValid = await validateToken(token, userName);
                if (isValid) {
                    setIsAuthenticated(true); // Token is valid
                } else if (refreshToken) {
                    // If token is invalid, try refreshing it
                    const { accessToken: newAccessToken } = await refreshAccessToken(refreshToken);
                    sessionStorage.setItem('accessToken', newAccessToken); // Update local storage
                    const refreshedValid = await validateToken(newAccessToken, userName); // Revalidate
                    setIsAuthenticated(refreshedValid); // Update authentication status
                } else {
                    throw new Error("Unable to validate or refresh token");
                }
            } catch (error) {
                console.error("Authentication error:", error);
                setIsAuthenticated(false); // Authentication failed
            } finally {
                setIsLoading(false); // Stop loading
            }
        };

        validateOrRefreshToken();
    }, [userName]);

    if (isLoading) return <div>Loading...</div>;
    if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
    return children;
};

export default ProtectedRoute;
