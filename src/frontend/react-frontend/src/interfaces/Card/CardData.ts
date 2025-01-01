export interface CardData {
  _id: string; 
  cardTitle: string; 
  content: any; // mongoose.Schema.Types.Mixed allows any type
  createdAt: Date; 
  updatedAt: Date; 
  dueDate?: Date; 
  tag?: string; 
  foldOrNot: Boolean,
  position: { 
    x: number;
    y: number;
  };
  dimensions: { 
    width: number;
    height: number;
  };
  connections?: Array<{
    id: string;
    //startDirection: 'top' | 'bottom' | 'left' | 'right';
    startCardId: string;
    startOffset: { x: number; y: number };
    endPoint: {
      x: number;
      y: number;
    };
  }>;
  comments?: Array<{ 
    commentId: string; 
    userId: string; 
    content: string;
    createdAt: Date; 
  }>;
}
