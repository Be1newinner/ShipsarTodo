"use client";

import { useState } from "react";
import { useTodos } from "@/hooks/useTodos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface TodoFormProps {
  onSuccess?: () => void;
}

export function TodoForm({ onSuccess }: TodoFormProps) {
  const { createTodo } = useTodos();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: new Date().toISOString().split("T")[0],
    priority: "medium" as "low" | "medium" | "high",
    estimatedTime: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createTodo({
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
        priority: formData.priority,
        estimatedTime: formData.estimatedTime
          ? parseInt(formData.estimatedTime)
          : 0,
        status: "pending",
        completionProbability: 50,
        subtasks: [],
        tags: [],
      });

      toast.success("Task created successfully!");
      setFormData({
        title: "",
        description: "",
        dueDate: new Date().toISOString().split("T")[0],
        priority: "medium",
        estimatedTime: "",
      });
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create task",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Task Title *
        </label>
        <Input
          id="title"
          placeholder="What needs to be done?"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          placeholder="Add more details about this task..."
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          disabled={isLoading}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="dueDate" className="text-sm font-medium">
            Due Date *
          </label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) =>
              setFormData({ ...formData, dueDate: e.target.value })
            }
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="priority" className="text-sm font-medium">
            Priority
          </label>
          <Select
            value={formData.priority}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                priority: value as "low" | "medium" | "high",
              })
            }
          >
            <SelectTrigger id="priority">
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

      <div className="space-y-2">
        <label htmlFor="estimatedTime" className="text-sm font-medium">
          Estimated Time (minutes)
        </label>
        <Input
          id="estimatedTime"
          type="number"
          placeholder="30"
          value={formData.estimatedTime}
          onChange={(e) =>
            setFormData({ ...formData, estimatedTime: e.target.value })
          }
          disabled={isLoading}
          min="0"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Task"}
      </Button>
    </form>
  );
}
