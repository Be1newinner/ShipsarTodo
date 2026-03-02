'use client';

import { useTodos } from '@/hooks/useTodos';
import { TodoCard } from './todo-card';

interface Todo {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  estimatedTime?: number;
  actualTime?: number;
  completionProbability: number;
  subtasks: Array<{
    id: string;
    title: string;
    completed: boolean;
    generatedByAI?: boolean;
  }>;
  assignedTo?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface TodoListProps {
  todos: Todo[];
}

export function TodoList({ todos }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No tasks yet. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {todos.map((todo) => (
        <TodoCard key={todo._id} todo={todo} />
      ))}
    </div>
  );
}
