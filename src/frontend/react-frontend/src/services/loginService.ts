// loginService.ts - Service for handling login issues

import { UserData } from '../interfaces/User/UserData';

const API_BASE_URL = 'http://localhost:3000/api/auth'; // according to your backend API

// POST /api/auth/login - Authenticate user by userName and password
export const authenticateUser = async (
    userName: string | null, 
    password: string | null
): Promise<UserData>  => {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName, password }),
    });

    if (!response.ok) {
        throw new Error("Invalid username or password");
    }

    const data = await response.json();
    // console.log("User NAME:", data.userName); // For debugging purposes
    return data;
}

// POST /api/auth/send-verification-code - Send a verification code to the user's email
export const sendVerificationCode = async (
    userName: string | null,
    email: string | null
): Promise<{ message: string; verificationCode?: string }> => {
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
