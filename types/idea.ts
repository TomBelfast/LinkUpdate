export interface Idea {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
} 