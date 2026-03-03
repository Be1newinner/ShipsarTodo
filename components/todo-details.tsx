"use client";

import { useState } from "react";
import { Todo } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { showSuccess, showError } from "@/lib/toast-utils";
import { apiPut } from "@/lib/api";
import { format } from "date-fns";
import { Clock, AlertCircle, CheckCircle, Loader } from "lucide-react";

interface TodoDetailsProps {
  todo: Todo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (todo: Todo) => void;
}

const priorityColors = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const statusColors = {
  pending: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export function TodoDetails({
  todo,
  open,
  onOpenChange,
  onUpdate,
}: TodoDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [description, setDescription] = useState(todo.description || "");
  const [status, setStatus] = useState(todo.status);
  const [priority, setPriority] = useState(todo.priority);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const updated = await apiPut<Todo>(`/todos/${todo._id}`, {
        description,
        status,
        priority,
      });
      onUpdate(updated);
      showSuccess("Todo updated successfully");
    } catch (error) {
      showError("Failed to update todo", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{todo.title}</DialogTitle>
          <DialogDescription>
            Created {format(new Date(todo.createdAt), "MMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as typeof status)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select
                value={priority}
                onValueChange={(val) => setPriority(val as typeof priority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            <Badge className={priorityColors[priority]}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
            </Badge>
            <Badge className={statusColors[status]}>
              {status.replace("_", " ").charAt(0).toUpperCase() +
                status.slice(1)}
            </Badge>
          </div>

          {/* Due Date */}
          {todo.dueDate && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              <span>
                Due: {format(new Date(todo.dueDate), "MMM d, yyyy HH:mm")}
              </span>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              className="min-h-24"
            />
          </div>

          {/* Estimated Time */}
          {todo.estimatedMinutes && (
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Estimated: {todo.estimatedMinutes} minutes</span>
            </div>
          )}

          {/* Completion Probability */}
          {todo.completionProbability !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>
                Completion Probability:{" "}
                {Math.round(todo.completionProbability * 100)}%
              </span>
            </div>
          )}

          {/* Subtasks */}
          {todo.subtasks && todo.subtasks.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Subtasks</label>
              <div className="space-y-2">
                {todo.subtasks.map((subtask) => (
                  <div
                    key={subtask._id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={subtask.completed}
                      disabled
                      className="w-4 h-4"
                    />
                    <span
                      className={
                        subtask.completed
                          ? "line-through text-muted-foreground"
                          : ""
                      }
                    >
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {todo.tags && todo.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {todo.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isUpdating}>
              {isUpdating && <Loader className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
