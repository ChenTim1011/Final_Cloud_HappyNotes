// loginService.ts - Service for handling login issues

import { UserData } from '../interfaces/User/UserData';

const API_BASE_URL = process.env.NODE_ENV === "production" ? "/api/auth" : "http://localhost:3000/api/auth";

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
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Invalid username or password");
    }

    const data = await response.json();
    // console.log("User NAME:", data.userName); // For debugging purposes
    return data;
}
