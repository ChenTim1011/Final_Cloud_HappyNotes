import { WhiteboardData } from '../Whiteboard/WhiteboardData';
import { CardData } from '../Card/CardData';

export interface UserData {
  _id: string;
  userName: string;
  userPassword: string;
  email: string;
  isLoggedin: boolean;
  whiteboards: WhiteboardData[]; // Array of associated whiteboards
  activityLog: Array<{
    logId: string; // ObjectId as string
    action: string; // e.g., "new", "delete", "edit"
    timestamp: Date;
    entityType: string; // e.g., "card", "board"
    entityId: string; // ObjectId as string
    detail: string;
  }>;
  tags: Array<{
    tagName: string;
    cardIds: string[]; // Array of Card ObjectIds as strings
  }>;
}
