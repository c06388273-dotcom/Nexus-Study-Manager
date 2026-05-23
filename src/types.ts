export interface UserData {
  id: string;
  email: string;
  displayName: string;
  xp: number;
  level: number;
  streak: number;
  createdAt: any;
  updatedAt: any;
}

export interface TaskData {
  id: string;
  userId: string;
  title: string;
  type: 'study' | 'habit' | 'todo';
  status: 'pending' | 'completed';
  createdAt: any;
  updatedAt: any;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
