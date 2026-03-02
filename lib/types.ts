export interface User {
  _id: string;
  email: string;
  name: string;
  profileSetup: boolean;
  timezone: string;
  workHoursStart: number;
  workHoursEnd: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Todo {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: Date;
  scheduledDate?: Date;
  completionProbability?: number;
  estimatedMinutes?: number;
  subtasks?: Subtask[];
  tags?: string[];
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface CompletionFeedback {
  _id: string;
  userId: string;
  todoId: string;
  timeSpent: number;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  notes?: string;
  createdAt: Date;
}

export interface Assignment {
  _id: string;
  todoId: string;
  assignedBy: string;
  assignedTo: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  delegationMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  _id: string;
  email: string;
  name: string;
  role: 'owner' | 'member';
  joinedAt: Date;
}

export interface Notification {
  _id: string;
  userId: string;
  type: 'assignment' | 'completion' | 'deadline' | 'comment';
  title: string;
  message: string;
  read: boolean;
  relatedId?: string;
  createdAt: Date;
}
