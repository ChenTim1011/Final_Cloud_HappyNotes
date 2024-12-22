// userService.ts - Service for handling user data

import { UserData } from '../interfaces/User/UserData';
import { UserUpdateData } from '@/interfaces/User/UserUpdateData';
import { CreateUserData } from '@/interfaces/User/CreateUserData';

const API_BASE_URL = 'http://localhost:3000/api/users'; // according to your backend API



// GET /api/users - Get all users
export const getAllUsers = async (): Promise<UserData[]> => {
    const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch users');
    }

    const data: UserData[] = await response.json();
    return data;
};

// GET /api/users/:id - Get user by ID
export const getUserById = async (id: string): Promise<UserData> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user');
    }

    const data: UserData = await response.json();
    return data;
};

// GET /api/users/name/:userName - Get user by NAME
export const getUserByName = async (userName: string | null | undefined): Promise<UserData[]> => {
    if (!userName) {
        throw new Error("User name is required");
    }

    const encodedUserName = encodeURIComponent(userName);
    const response = await fetch(`${API_BASE_URL}/name/${encodedUserName}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user');
    }

    const data: UserData[] = await response.json();
    return data;
};

// POST /api/users - Create a new user
export const createUser = async (
    user: CreateUserData
): Promise<UserData> => {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
    }

    const data: UserData = await response.json();
    return data;
};

// PUT /api/users/:id - update the user with the specified ID
export const updateUser = async (
    id: string,
    updateData: UserUpdateData
): Promise<UserData> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
    }

    const data: UserData = await response.json();
    return data;
};

// DELETE /api/users/:id
export const deleteUserById = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
    }

};
