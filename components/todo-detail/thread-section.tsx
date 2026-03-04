import { useState } from "react";
import { Thread } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showSuccess, showError } from "@/lib/toast-utils";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Plus, Loader2, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ThreadSectionProps {
  todoId: string;
  threads: Thread[];
  onThreadCreated: (thread: Thread) => void;
}

export function ThreadSection({
  todoId,
  threads,
  onThreadCreated,
}: ThreadSectionProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      const photos = photoUrl.trim() ? [photoUrl.trim()] : [];
      const newThread = await apiPost<Thread>(`/todos/${todoId}/threads`, {
        title: title.trim(),
        description: description.trim(),
        photos,
      });
      onThreadCreated(newThread);
      setTitle("");
      setDescription("");
      setPhotoUrl("");
      showSuccess("Comment added");
    } catch (error) {
      showError("Failed to add comment", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Thread Creation Form */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-3 pt-4">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Start a discussion
          </h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Title (Optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background"
            />
            <Textarea
              placeholder="What do you want to share or discuss?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="min-h-24 bg-background"
            />
            <div className="flex gap-2">
              <div className="relative flex-1">
                <ImageIcon className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Image URL (Optional)"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || !description.trim()}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Post
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Threads List */}
      <div className="space-y-6">
        <h3 className="font-semibold text-lg flex items-center justify-between">
          <span>Discussion History</span>
          <span className="text-sm font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {threads.length} {threads.length === 1 ? "comment" : "comments"}
          </span>
        </h3>

        {threads.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
            No comments yet. Be the first to start a discussion!
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border before:to-transparent">
            {threads.map((thread, index) => (
              <div
                key={thread._id}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                {/* Timeline dot */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-primary text-primary-foreground shadow-xs shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  {/* Normally user avatar, fallback to first letter of default name */}
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>

                {/* Content */}
                <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    {thread.title && (
                      <h4 className="font-semibold text-md">{thread.title}</h4>
                    )}
                    <span className="text-xs text-muted-foreground shrink-0 ml-auto bg-secondary/50 px-2 py-1 rounded">
                      {formatDistanceToNow(new Date(thread.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  <p className="text-sm whitespace-pre-wrap flex-1">
                    {thread.description}
                  </p>

                  {thread.photos && thread.photos.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {thread.photos.map((url, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={i}
                          src={url}
                          alt={`Thread media ${i}`}
                          className="rounded-md object-cover w-full h-32 border border-border/50"
                        />
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
