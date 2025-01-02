// loginService.ts - Service for handling login issues

import { UserData } from '../interfaces/User/UserData';

const API_BASE_URL = process.env.NODE_ENV === "production" ? "/api/auth" : "http://localhost:3000/api/auth";

export const authenticateUser = async (
    userName: string | null, 
    password: string | null
): Promise<{ user: UserData; accessToken: string; refreshToken: string }>  => {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName, password }),
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.error || '登入失敗');
        (error as any).response = { data };
        throw error;
      }
      
      return data;
}

// POST /api/auth/refresh - Refresh the access token using the provided refresh token
export const refreshAccessToken = async (
    refreshToken: string
): Promise< { accessToken: string }>  => {
    const response = await fetch(`${API_BASE_URL}/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
        throw new Error("Failed to refresh access token");
    }

    const data = await response.json();
    return data; // { accessToken: string }
};

// POST /api/auth/validate-token - Validate token and match it with the provided userName
export const validateToken = async (
    token: string, 
    userName: string | undefined
): Promise<boolean> => {
    if (!token || !userName) {
        throw new Error("Token and userName are required");
    }

    const response = await fetch(`${API_BASE_URL}/validate-token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userName }),
    });

    if (!response.ok) {
        return false; // Token validation failed
    }

    return true; // Token validation succeeded
};

// POST /api/auth/send-verification-code - Send a verification code to the user's email
export const sendVerificationCode = async (
    userName: string | null,
    email: string | null
): Promise<{ message: string }> => {
    if (!userName || !email) {
        throw new Error("userName and email are required");
    }

    const response = await fetch(`${API_BASE_URL}/send-verification-code`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName, email }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send verification code");
    }

    const data = await response.json();
    return data;
};

// POST /api/auth/verify-code - Verify the verification code provided by the user
export const verifyCode = async (
    userName: string | null,
    email: string | null,
    code: string | null
): Promise<{ message: string }> => {
    if (!userName || !email || !code) {
        throw new Error("userName, email, and code are required");
    }
    const response = await fetch(`${API_BASE_URL}/verify-code`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName, email, code }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to verify code");
    }

    const data = await response.json();
    return data;
};

// GET /api/auth/me - Get current user based on token
export const getUserFromToken = async (): Promise<UserData> => {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
        throw new Error('No access token found');
    }

    const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error('Failed to fetch current user');
    }

    const data: UserData = await response.json();
    return data;
};