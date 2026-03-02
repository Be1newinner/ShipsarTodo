'use client';

import { useState } from 'react';
import { Todo, Subtask } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { showSuccess, showError } from '@/lib/toast-utils';
import { apiPost } from '@/lib/api';
import { Loader, Sparkles, Check } from 'lucide-react';

interface AISubtaskGeneratorProps {
  todo: Todo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubtasksGenerated: (subtasks: Subtask[]) => void;
}

interface GeneratedSubtask {
  title: string;
  description: string | null;
  estimatedMinutes: number | null;
  order: number;
}

export function AISubtaskGenerator({
  todo,
  open,
  onOpenChange,
  onSubtasksGenerated,
}: AISubtaskGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedSubtask[] | null>(null);
  const [explanation, setExplanation] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await apiPost<{
        subtasks: GeneratedSubtask[];
        explanation: string;
      }>('/ai/subtasks', {
        todoTitle: todo.title,
        todoDescription: todo.description,
        priority: todo.priority,
      });

      setGenerated(result.subtasks);
      setExplanation(result.explanation);
      showSuccess('Subtasks generated successfully');
    } catch (error) {
      showError('Failed to generate subtasks', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccept = () => {
    if (generated) {
      const subtasks: Subtask[] = generated.map((sub) => ({
        _id: `subtask-${Date.now()}-${Math.random()}`,
        title: sub.title,
        completed: false,
        order: sub.order,
      }));
      onSubtasksGenerated(subtasks);
      onOpenChange(false);
      setGenerated(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Generate Subtasks with AI
          </DialogTitle>
          <DialogDescription>
            AI will break down your task into actionable subtasks
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">{todo.title}</h4>
            {todo.description && (
              <p className="text-sm text-muted-foreground">{todo.description}</p>
            )}
          </div>

          {!generated ? (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating && <Loader className="w-4 h-4 mr-2 animate-spin" />}
              Generate Subtasks
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Generated Subtasks</h3>
                <div className="space-y-3">
                  {generated.map((subtask, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium">{subtask.title}</h4>
                        <Badge variant="outline">
                          {subtask.estimatedMinutes}m
                        </Badge>
                      </div>
                      {subtask.description && (
                        <p className="text-sm text-muted-foreground">
                          {subtask.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {explanation && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">AI Reasoning</p>
                  <p className="text-sm text-muted-foreground">{explanation}</p>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setGenerated(null)}
                >
                  Regenerate
                </Button>
                <Button
                  onClick={handleAccept}
                  className="gap-2"
                >
                  <Check className="w-4 h-4" />
                  Accept Subtasks
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
