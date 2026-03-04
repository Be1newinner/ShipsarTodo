"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiGet } from "@/lib/api";
import { Todo, Thread } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TodoInfo } from "@/components/todo-detail/todo-info";
import { SubtaskManager } from "@/components/todo-detail/subtask-manager";
import { ThreadSection } from "@/components/todo-detail/thread-section";
import { showSuccess, showError } from "@/lib/toast-utils";

export default function TodoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [todo, setTodo] = useState<Todo | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const todoId = params.id as string;

  useEffect(() => {
    if (!todoId) return;

    const fetchTodoDetails = async () => {
      try {
        const [todoData, threadsData] = await Promise.all([
          apiGet<Todo>(`/todos/${todoId}`),
          apiGet<Thread[]>(`/todos/${todoId}/threads`),
        ]);
        setTodo(todoData);
        setThreads(threadsData);
      } catch (error) {
        showError("Failed to fetch todo details", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodoDetails();
  }, [todoId]);

  const handleUpdate = (updatedTodo: Todo) => {
    setTodo(updatedTodo);
  };

  const handleThreadCreated = (newThread: Thread) => {
    setThreads((prev) => [newThread, ...prev]);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!todo) {
    return (
      <div className="flex-1 p-8 text-center text-muted-foreground">
        <h2>Todo not found</h2>
        <Button variant="link" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-linear-to-b from-background to-card/20 p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Todo Details</h1>
      </div>

      <div className="max-w-5xl mx-auto border border-border/50 bg-card rounded-xl p-6 shadow-xs">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="details">Details & Media</TabsTrigger>
            <TabsTrigger value="subtasks">Subtasks & AI</TabsTrigger>
            <TabsTrigger value="threads">
              Threads ({threads.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-0 space-y-4">
            <TodoInfo todo={todo} onUpdate={handleUpdate} />
          </TabsContent>

          <TabsContent value="subtasks" className="mt-0">
            <SubtaskManager todo={todo} onUpdate={handleUpdate} />
          </TabsContent>

          <TabsContent value="threads" className="mt-0">
            <ThreadSection
              todoId={todo._id}
              threads={threads}
              onThreadCreated={handleThreadCreated}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
