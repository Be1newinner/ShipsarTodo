"use client";

import { useState } from "react";
import { useTodos } from "@/hooks/useTodos";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TodoList } from "@/components/todo-list";
import { TodoForm } from "@/components/todo-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const showNewTodo = searchParams.get("new") === "true";
  const [isDialogOpen, setIsDialogOpen] = useState(showNewTodo);
  const [searchQuery, setSearchQuery] = useState("");

  const { todos, isLoading } = useTodos();
  const { user } = useAuth();

  // Filter todos
  const safeTodos = Array.isArray(todos) ? todos : [];
  const filteredTodos = safeTodos.filter((todo) =>
    todo.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const todaysTodos = filteredTodos.filter((todo) => {
    const today = new Date().toDateString();
    const dueDate = new Date(todo.dueDate).toDateString();
    return dueDate === today;
  });

  const overdueTodos = filteredTodos.filter((todo) => {
    const today = new Date();
    const dueDate = new Date(todo.dueDate);
    return dueDate < today && todo.status !== "completed";
  });

  const completedTodos = filteredTodos.filter(
    (todo) => todo.status === "completed",
  );

  return (
    <div className="flex-1 space-y-8 p-8 bg-linear-to-b from-background to-card/20">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">
          Welcome back, {user?.name?.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground">
          Here's what you need to accomplish today
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Clock className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Today's Tasks</p>
                <p className="text-2xl font-bold">{todaysTodos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{overdueTodos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedTodos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Create */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="whitespace-nowrap"
        >
          Create Task
        </Button>
      </div>

      {/* Todo List */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <p className="text-muted-foreground">
                No tasks found. Create your first one!
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>Create Task</Button>
            </div>
          ) : (
            <TodoList todos={filteredTodos} />
          )}
        </CardContent>
      </Card>

      {/* New Todo Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Task</DialogTitle>
            <DialogDescription>
              Add a new task to your todo list
            </DialogDescription>
          </DialogHeader>
          <TodoForm onSuccess={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
