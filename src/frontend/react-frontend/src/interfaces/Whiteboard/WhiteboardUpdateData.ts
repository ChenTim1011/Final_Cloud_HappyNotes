
export interface WhiteboardUpdateData {
    cards: string[]; 
    position?: { x: number; y: number };
    dimensions?: { width: number; height: number };
    updatedAt?: Date;
}