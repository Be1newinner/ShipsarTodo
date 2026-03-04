import { useState } from "react";
import { Todo } from "@/lib/types";
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
import { Badge } from "@/components/ui/badge";
import { showSuccess, showError } from "@/lib/toast-utils";
import { apiPut } from "@/lib/api";
import { format } from "date-fns";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  Loader,
  Plus,
  Trash2,
} from "lucide-react";

interface TodoInfoProps {
  todo: Todo;
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

export function TodoInfo({ todo, onUpdate }: TodoInfoProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [title, setTitle] = useState(todo.title || "");
  const [description, setDescription] = useState(todo.description || "");
  const [status, setStatus] = useState(todo.status);
  const [priority, setPriority] = useState(todo.priority);
  const [photos, setPhotos] = useState<string[]>(todo.photos || []);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const updated = await apiPut<Todo>(`/todos/${todo._id}`, {
        title,
        description,
        status,
        priority,
        photos,
      });
      onUpdate(updated);
      showSuccess("Todo updated successfully");
    } catch (error) {
      showError("Failed to update todo", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const addPhoto = () => {
    if (newPhotoUrl.trim()) {
      setPhotos([...photos, newPhotoUrl.trim()]);
      setNewPhotoUrl("");
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start">
        <div className="flex-1 mr-4">
          <label className="text-sm font-medium mb-1 block">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-semibold h-12"
          />
        </div>
        <div className="text-right text-sm text-muted-foreground pt-1">
          <p>Created: {format(new Date(todo.createdAt), "MMM d, yyyy")}</p>
          {todo.dueDate && (
            <p className="flex items-center justify-end gap-1 mt-1 text-primary font-medium">
              <Clock className="w-4 h-4" />
              Due: {format(new Date(todo.dueDate), "MMM d, yyyy HH:mm")}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-4 border-y border-border/50 py-6">
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

      <div className="flex gap-2 flex-wrap">
        <Badge className={priorityColors[priority]}>
          {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
        </Badge>
        <Badge className={statusColors[status]}>
          {status.replace("_", " ").charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
        {todo.estimatedMinutes && (
          <Badge variant="outline" className="gap-1">
            <AlertCircle className="w-3 h-3" /> {todo.estimatedMinutes} min
          </Badge>
        )}
        {todo.completionProbability !== undefined && (
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="w-3 h-3" />{" "}
            {Math.round(todo.completionProbability * 100)}% Prob.
          </Badge>
        )}
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a detailed description..."
          className="min-h-32 resize-y"
        />
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium block">Photos & Media</label>

        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((url, i) => (
              <div
                key={i}
                className="group relative aspect-video rounded-md overflow-hidden bg-muted border border-border/50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Todo media ${i}`}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removePhoto(i)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 max-w-md">
          <Input
            placeholder="Paste image URL here..."
            value={newPhotoUrl}
            onChange={(e) => setNewPhotoUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addPhoto()}
          />
          <Button type="button" variant="secondary" onClick={addPhoto}>
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button
          onClick={handleSave}
          disabled={isUpdating}
          size="lg"
          className="w-full sm:w-auto"
        >
          {isUpdating && <Loader className="w-4 h-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
