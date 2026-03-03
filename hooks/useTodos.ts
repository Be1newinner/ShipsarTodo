"use client";

import useSWR from "swr";

interface Todo {
  _id: string;
  userId: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed";
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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTodos() {
  const {
    data: todos = [],
    error,
    isLoading,
    mutate,
  } = useSWR<Todo[]>("/api/todos", fetcher);

  const createTodo = async (
    todoData: Omit<
      Todo,
      "_id" | "userId" | "projectId" | "createdAt" | "updatedAt"
    >,
  ) => {
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(todoData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create todo");
    }

    const newTodo = await res.json();
    mutate([...todos, newTodo]);
    return newTodo;
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update todo");
    }

    const updatedTodo = await res.json();
    const newTodos = todos.map((t) => (t._id === id ? updatedTodo : t));
    mutate(newTodos);
    return updatedTodo;
  };

  const deleteTodo = async (id: string) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to delete todo");
    }

    const newTodos = todos.filter((t) => t._id !== id);
    mutate(newTodos);
  };

  return {
    todos,
    error,
    isLoading,
    createTodo,
    updateTodo,
    deleteTodo,
    mutate,
  };
}
