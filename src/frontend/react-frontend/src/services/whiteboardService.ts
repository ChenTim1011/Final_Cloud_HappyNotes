// whiteboardService.ts - Service for handling whiteboard data

import { WhiteboardData } from '../interfaces/Whiteboard/WhiteboardData';
import { WhiteboardUpdateData } from '@/interfaces/Whiteboard/WhiteboardUpdateData';
import { CreateWhiteboardData } from '@/interfaces/Whiteboard/CreateWhiteboardData';

const API_BASE_URL = 'http://localhost:3000/api/whiteboards'; // according to your backend API



// GET /api/whiteboards - Get all whiteboards or filter by userId
export const getAllWhiteboards = async (userId?: string): Promise<WhiteboardData[]> => {
    let url = API_BASE_URL;
    if (userId) {
        url += `?userId=${userId}`;
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch whiteboards');
    }

    const data: WhiteboardData[] = await response.json();
    return data;
};

// GET /api/whiteboards/:id - Get whiteboard by ID
export const getWhiteboardById = async (id: string): Promise<WhiteboardData> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch whiteboard');
    }

    const data: WhiteboardData = await response.json();
    return data;
};

// POST /api/whiteboards - Create a new whiteboard
export const createWhiteboard = async (
    whiteboard: CreateWhiteboardData
): Promise<WhiteboardData> => {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(whiteboard),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create whiteboard');
    }

    const data: WhiteboardData = await response.json();
    return data;
};

// PUT /api/whiteboards/:id - update the whiteboard with the specified ID
export const updateWhiteboard = async (
    id: string,
    updateData: Partial<WhiteboardUpdateData>
): Promise<WhiteboardData> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update whiteboard');
    }

    const data: WhiteboardData = await response.json();
    return data;
};

// DELETE /api/whiteboards/:id
export const deleteWhiteboardById = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete whiteboard');
    }

};
