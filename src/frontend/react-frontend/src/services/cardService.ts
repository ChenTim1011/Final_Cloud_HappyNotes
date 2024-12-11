// cardService.ts - Service for handling card data

import { CardData } from '@/interfaces/Card/CardData';

const API_BASE_URL = 'http://localhost:3000/api/cards'; // according to your backend API


const handleRequestError = async (response: Response, defaultMessage: string) => {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.error || defaultMessage);
    }
    throw new Error(defaultMessage);
};

// GET /api/cards - Get all cards
export const getAllCards = async (): Promise<CardData[]> => {
    const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        await handleRequestError(response, 'Failed to fetch cards');
    }
    
    const data: CardData[] = await response.json();
    return data;
};



// GET /api/cards/:id - Get card by ID
export const patchCard = async (id: string, changes: Partial<CardData>): Promise<CardData> => {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ changes }),
        });

        if (!response.ok) {
            await handleRequestError(response, 'Failed to update card');
        }

        return await response.json();
    } catch (error) {
        console.error('Error patching card:', error);
        throw error;
    }
};


// POST /api/cards - Create a new card
export const createCard = async (card: Omit<CardData, '_id'>): Promise<CardData> => {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(card),
    });

    if (!response.ok) {
        await handleRequestError(response, 'Failed to create card');
    }

    const data: CardData = await response.json();
    return data;
};


export const updateCard = async (id: string, card: Partial<CardData>): Promise<CardData> => {
    console.warn('Consider using patchCard for partial updates instead of updateCard');
    return patchCard(id, card);
};

// PUT /api/cards/:id - update the card with the specified ID
export const deleteCard = async (id: string): Promise<void> => {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            await handleRequestError(response, 'Failed to delete card');
        }
    } catch (error) {
        console.error('Error deleting card:', error);
        throw error;
    }
};