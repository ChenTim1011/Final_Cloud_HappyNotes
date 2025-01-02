// cardService.ts - Service for handling card data

import { CardData } from '@/interfaces/Card/CardData';


const API_BASE_URL = process.env.NODE_ENV === "production" ? "/api/cards" : "http://localhost:3000/api/cards";
interface PatchCardUpdate {
    id: string;
    changes: Partial<CardData>;
}




export const updateConnection = async (
    cardId: string, 
    connectionId: string, 
    updates: {
        startOffset?: { x: number; y: number };
        endPoint?: { x: number; y: number };
        text?: string;
    }
): Promise<void> => {
    const url = `${API_BASE_URL}/${cardId}/connections/${connectionId}`;
    try {
        //console.log('Sending PATCH request:', { cardId, connectionId, updates });
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            await handleRequestError(response, 'Failed to update connection');
        }

        console.log('Connection updated successfully');
    } catch (error) {
        console.error('Error updating connection:', error);
        throw error;
    }
};




export const deleteConnection = async (cardId: string, connectionId: string): Promise<void> => {
    console.log('Sending DELETE request:', { cardId , connectionId});
    const url = `${API_BASE_URL}/${cardId}/${connectionId}`;
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        console.error(`Failed to delete connection with ID: ${connectionId}`);
        throw new Error('Failed to delete connection');
      }
  
      console.log(`Connection ${connectionId} deleted successfully.`);
    } catch (error) {
      console.error('Error deleting connection:', error);
      throw error;
    }
  };

export const addConnection = async (cardId: string, newConnection: { 
    id: string; 
    startOffset: { x: number; y: number }
    endPoint: { x: number; y: number };
}): Promise<void> => {
    //const card = await fetch(`${API_BASE_URL}/${cardId}`);
    //const cardData = await card.json();
    //const updatedConnections = [...(cardData.connections || []), newConnection];
    const url = `${API_BASE_URL}/${cardId}/connections`;

    // 打印 URL 和數據
    //console.log("PPPP");
   // console.log("Sending request to:", url);
    //console.log("Request body:", newConnection);
    try {
        const response = await fetch(`${API_BASE_URL}/${cardId}/connections`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ connections: [newConnection] }),
            //body: JSON.stringify({ connections: updatedConnections }),
        });
        //console.log("RRResponse", response);

        if (!response.ok) {
            await handleRequestError(response, 'Failed to add connection');
        }
    } catch (error) {
        console.error('Error adding connection:', error);
        throw error;
    }
};


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
        credentials: "include",
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
            credentials: "include",
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
        credentials: "include",
    });

    if (!response.ok) {
        await handleRequestError(response, 'Failed to create card');
    }

    const data: CardData = await response.json();
    return data;
};

// POST /api/cards/withWhiteboardId - Create a new card with a whiteboard ID
export const createCardWithWhiteboard = async (whiteboardId: string, card: Omit<CardData, '_id'>): Promise<CardData> => {
    const response = await fetch(`${API_BASE_URL}/withWhiteboardId`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ whiteboardId, ...card }),
        credentials: "include",
    });

    if (!response.ok) {
        await handleRequestError(response, 'Failed to create card with whiteboard');
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
            credentials: "include",
        });

        if (!response.ok) {
            await handleRequestError(response, 'Failed to delete card');
        }
    } catch (error) {
        console.error('Error deleting card:', error);
        throw error;
    }
};

export const patchCardsBatch = async (updates: PatchCardUpdate[]): Promise<void> => {
    try {
        const response = await fetch(`${API_BASE_URL}/batch`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ updates }),
            credentials: "include",
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('批量更新卡片失敗:', errorData);
            throw new Error(errorData.message || '批量更新卡片失敗');
        }


    } catch (error) {
        console.error('批量更新卡片失敗:', error);
        throw error;
    }
};