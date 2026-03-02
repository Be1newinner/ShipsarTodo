'use client';

import { useState } from 'react';
import { Todo } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/lib/toast-utils';
import { apiPost } from '@/lib/api';
import { Loader } from 'lucide-react';

interface CompletionFeedbackProps {
  todo: Todo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: () => void;
}

export function CompletionFeedback({
  todo,
  open,
  onOpenChange,
  onSubmit,
}: CompletionFeedbackProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeSpent, setTimeSpent] = useState<number>(
    todo.estimatedMinutes || 30
  );
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(
    'medium'
  );
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await apiPost('/feedback', {
        todoId: todo._id,
        timeSpent,
        difficulty,
        completed: true,
        notes,
      });
      showSuccess('Feedback recorded successfully');
      onOpenChange(false);
      onSubmit?.();
    } catch (error) {
      showError('Failed to submit feedback', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Task Completed!</DialogTitle>
          <DialogDescription>
            Help us improve by sharing how it went
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">{todo.title}</h4>
          </div>

          {/* Time Spent */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Time Spent: {timeSpent} minutes
            </Label>
            <Slider
              value={[timeSpent]}
              onValueChange={(value) => setTimeSpent(value[0])}
              min={5}
              max={180}
              step={5}
              className="w-full"
            />
          </div>

          {/* Difficulty */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              How difficult was this task?
            </Label>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Notes (optional)
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this task..."
              className="min-h-20"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader className="w-4 h-4 mr-2 animate-spin" />}
              Submit Feedback
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
