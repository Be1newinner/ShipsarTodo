import { useState } from "react";
import { Todo, Subtask } from "@/lib/types";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showSuccess, showError } from "@/lib/toast-utils";
import { apiPut } from "@/lib/api";
import {
  Bot,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  CalendarIcon,
  MessageSquare,
  Send,
  Wand2,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { format } from "date-fns";

interface SubtaskManagerProps {
  todo: Todo;
  onUpdate: (todo: Todo) => void;
}

export function SubtaskManager({ todo, onUpdate }: SubtaskManagerProps) {
  const [showAiChat, setShowAiChat] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const subtasks = todo.subtasks || [];

  const [chatInput, setChatInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/split-todo",
      body: { todoId: todo._id },
    }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;
    await sendMessage({ text: chatInput });
    setChatInput("");
    // In this version, we might need a different way to check for tool calls
    // But let's fix the type errors first.
  };

  const handleAddManualSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;

    const newSubtask: Subtask = {
      _id: `temp-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
      order: subtasks.length + 1,
    };

    const updatedSubtasks = [...subtasks, newSubtask];

    try {
      const updatedTodo = await apiPut<Todo>(`/todos/${todo._id}`, {
        subtasks: updatedSubtasks,
      });
      onUpdate(updatedTodo);
      setNewSubtaskTitle("");
      showSuccess("Subtask added");
    } catch (error) {
      showError("Failed to add subtask", error);
    }
  };

  const toggleSubtask = async (subtaskId: string) => {
    const updatedSubtasks = subtasks.map((st) =>
      st._id === subtaskId || (st as any).id === subtaskId
        ? { ...st, completed: !st.completed }
        : st,
    );

    try {
      const updatedTodo = await apiPut<Todo>(`/todos/${todo._id}`, {
        subtasks: updatedSubtasks,
      });
      onUpdate(updatedTodo);
    } catch (error) {
      showError("Failed to update subtask", error);
    }
  };

  const removeSubtask = async (subtaskId: string) => {
    const updatedSubtasks = subtasks.filter(
      (st) => st._id !== subtaskId && (st as any).id !== subtaskId,
    );

    try {
      const updatedTodo = await apiPut<Todo>(`/todos/${todo._id}`, {
        subtasks: updatedSubtasks,
      });
      onUpdate(updatedTodo);
      showSuccess("Subtask removed");
    } catch (error) {
      showError("Failed to remove subtask", error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Subtasks</h3>
          <p className="text-sm text-muted-foreground">
            Break down your work into smaller steps
          </p>
        </div>
        <Button
          variant={showAiChat ? "default" : "outline"}
          className="gap-2 transition-all"
          onClick={() => setShowAiChat(!showAiChat)}
        >
          {showAiChat ? (
            <X className="w-4 h-4" />
          ) : (
            <Wand2 className="w-4 h-4 text-purple-500" />
          )}
          {showAiChat ? "Close AI" : "Split with AI"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Subtasks List */}
        <div
          className={`${showAiChat ? "lg:col-span-7" : "lg:col-span-12"} space-y-4 transition-all duration-300`}
        >
          <div className="flex gap-2">
            <Input
              placeholder="Add a new subtask manually..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddManualSubtask()}
            />
            <Button variant="secondary" onClick={handleAddManualSubtask}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2 mt-4">
            {subtasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg bg-card/30">
                No subtasks yet. You can add one manually or ask AI to help!
              </div>
            ) : (
              subtasks.map((st) => (
                <div
                  key={st._id || (st as any).id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${st.completed ? "bg-muted/50 border-transparent" : "bg-card border-border/50"}`}
                >
                  <button
                    onClick={() => toggleSubtask(st._id || (st as any).id)}
                    className="mt-0.5 shrink-0"
                  >
                    {st.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium ${st.completed ? "line-through text-muted-foreground" : ""}`}
                    >
                      {st.title}
                    </p>
                    {st.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {st.description}
                      </p>
                    )}
                    {(st as any).generatedByAI && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded mt-2">
                        <Bot className="w-3 h-3" /> AI Generated
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {st.dueDate && (
                      <span className="flex items-center gap-1 text-xs font-medium text-orange-500 bg-orange-500/10 px-2 py-1 rounded">
                        <CalendarIcon className="w-3 h-3" />
                        {format(new Date(st.dueDate), "MMM d")}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeSubtask(st._id || (st as any).id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: AI Chat Drawer */}
        {showAiChat && (
          <Card className="lg:col-span-5 flex flex-col h-[500px] border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] animate-in slide-in-from-right-8 duration-300">
            <CardHeader className="py-3 px-4 border-b bg-muted/30">
              <CardTitle className="text-base flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-500" /> AI Assistant
              </CardTitle>
              <CardDescription className="text-xs">
                Chat to split this task into actionable steps.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-muted-foreground">
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Wand2 className="w-6 h-6 text-purple-500" />
                  </div>
                  <p className="text-sm max-w-[200px]">
                    Hi! I can help you break down this task. Just ask me to
                    split it!
                  </p>
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-purple-500/10 text-purple-500"}`}
                    >
                      {m.role === "user" ? (
                        <MessageSquare className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div
                      className={`px-3 py-2 rounded-lg text-sm max-w-[80%] ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                    >
                      {m.parts?.map((part: any, i: number) => (
                        <div key={i}>
                          {part.type === "text" && part.text}
                          {part.type === "tool-call" && (
                            <div className="mt-2 text-xs font-mono bg-background/50 text-foreground p-2 rounded border border-border">
                              [System: Saving subtasks to database...]
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-muted flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </CardContent>
            <div className="p-3 border-t bg-muted/10">
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask AI to split this task..."
                  className="focus-visible:ring-purple-500"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !chatInput.trim()}
                  className="shrink-0 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
