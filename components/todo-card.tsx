"use client";

import { useTodos } from "@/hooks/useTodos";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { Todo } from "@/hooks/useTodos";
interface TodoCardProps {
  todo: Todo;
}

export function TodoCard({ todo }: TodoCardProps) {
  const { updateTodo, deleteTodo } = useTodos();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = todo.status === "completed" ? "pending" : "completed";
    try {
      await updateTodo(todo._id, { status: newStatus });
      toast.success(`Task marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTodo(todo._id);
        toast.success("Task deleted");
      } catch (error) {
        toast.error("Failed to delete task");
      }
    }
  };

  const dueDate = new Date(todo.dueDate);
  const isOverdue = dueDate < new Date() && todo.status !== "completed";

  return (
    <Card
      className={`border-border/50 ${isOverdue ? "border-red-500/50" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox
              checked={todo.status === "completed"}
              onCheckedChange={handleToggleStatus}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <Link
                href={`/dashboard/todos/${todo._id}`}
                className="hover:underline"
              >
                <h3
                  className={`font-semibold text-sm line-clamp-2 ${
                    todo.status === "completed"
                      ? "line-through text-muted-foreground"
                      : "text-primary"
                  }`}
                >
                  {todo.title}
                </h3>
              </Link>
              {todo.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {todo.description}
                </p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Subtasks */}
        {todo.subtasks.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Subtasks: {todo.subtasks.filter((s) => s.completed).length}/
              {todo.subtasks.length}
            </p>
            <div className="space-y-1">
              {todo.subtasks.slice(0, 2).map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2">
                  <Checkbox checked={subtask.completed} disabled />
                  <span className="text-xs line-clamp-1">{subtask.title}</span>
                </div>
              ))}
              {todo.subtasks.length > 2 && (
                <p className="text-xs text-muted-foreground">
                  +{todo.subtasks.length - 2} more
                </p>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(todo.priority)}`}
          >
            {todo.priority}
          </span>
          <span
            className={`text-xs ${isOverdue ? "text-red-600 dark:text-red-400 font-semibold" : "text-muted-foreground"}`}
          >
            {formatDistanceToNow(dueDate, { addSuffix: true })}
          </span>
          {todo.estimatedTime && (
            <span className="text-xs text-muted-foreground">
              ~{todo.estimatedTime}m
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
