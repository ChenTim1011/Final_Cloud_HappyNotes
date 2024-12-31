import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { userName } = useParams();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setIsLoading(false);
            return;
        }

        // 驗證 token 與路由參數是否匹配
        fetch('http://localhost:3000/api/auth/validate-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userName }),
        })
            .then((res) => {
                if (res.ok) return res.json();
                throw new Error('Unauthorized');
            })
            .then(() => setIsAuthenticated(true))
            .catch(() => setIsAuthenticated(false))
            .finally(() => setIsLoading(false));
    }, [userName]);

    if (isLoading) return <div>Loading...</div>;
    if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
    return children;
};

export default ProtectedRoute;
