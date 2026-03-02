'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Todo } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/lib/toast-utils';
import { apiPost, apiPut } from '@/lib/api';
import { Loader, Sparkles, Calendar } from 'lucide-react';

interface AIScheduleSuggestionProps {
  todo: Todo;
  upcomingTodos: Todo[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduled?: () => void;
}

interface ScheduleSuggestion {
  recommendedDate: string;
  recommendedTime: string;
  reasoning: string;
  alternativeSlots: Array<{
    date: string;
    time: string;
    reason: string;
  }>;
}

export function AIScheduleSuggestion({
  todo,
  upcomingTodos,
  open,
  onOpenChange,
  onScheduled,
}: AIScheduleSuggestionProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState<ScheduleSuggestion | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('primary');
  const [isScheduling, setIsScheduling] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await apiPost<ScheduleSuggestion>('/ai/schedule', {
        todoTitle: todo.title,
        estimatedMinutes: todo.estimatedMinutes || 30,
        priority: todo.priority,
        upcomingTodos: upcomingTodos.filter((t) => t.status !== 'completed'),
      });

      setSuggestion(result);
      showSuccess('Schedule suggestions generated');
    } catch (error) {
      showError('Failed to generate schedule suggestions', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSchedule = async () => {
    if (!suggestion) return;

    setIsScheduling(true);
    try {
      let selectedDate: string;
      let selectedTime: string;

      if (selectedSlot === 'primary') {
        selectedDate = suggestion.recommendedDate;
        selectedTime = suggestion.recommendedTime;
      } else {
        const altIndex = parseInt(selectedSlot.replace('alt-', ''));
        const alt = suggestion.alternativeSlots[altIndex];
        selectedDate = alt.date;
        selectedTime = alt.time;
      }

      const [hours, minutes] = selectedTime.split(':');
      const scheduledDate = new Date(selectedDate);
      scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      await apiPut(`/todos/${todo._id}`, {
        scheduledDate: scheduledDate.toISOString(),
      });

      showSuccess('Task scheduled successfully');
      onOpenChange(false);
      onScheduled?.();
    } catch (error) {
      showError('Failed to schedule task', error);
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI-Powered Scheduling
          </DialogTitle>
          <DialogDescription>
            Get intelligent scheduling suggestions based on your tasks
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">{todo.title}</h4>
            <div className="flex gap-2 items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{todo.estimatedMinutes || 30} minutes</span>
              <Badge>{todo.priority}</Badge>
            </div>
          </div>

          {!suggestion ? (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating && <Loader className="w-4 h-4 mr-2 animate-spin" />}
              Generate Schedule Suggestions
            </Button>
          ) : (
            <div className="space-y-4">
              <RadioGroup value={selectedSlot} onValueChange={setSelectedSlot}>
                {/* Primary Recommendation */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 p-3 border-2 border-primary rounded-lg">
                    <RadioGroupItem
                      value="primary"
                      id="primary"
                      checked={selectedSlot === 'primary'}
                    />
                    <Label htmlFor="primary" className="flex-1 cursor-pointer">
                      <div className="font-semibold">
                        {format(
                          new Date(suggestion.recommendedDate),
                          'EEEE, MMMM d'
                        )}{' '}
                        at {suggestion.recommendedTime}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {suggestion.reasoning}
                      </div>
                    </Label>
                    <Badge>Recommended</Badge>
                  </div>
                </div>

                {/* Alternative Slots */}
                {suggestion.alternativeSlots.length > 0 && (
                  <div className="space-y-3 pt-2 border-t">
                    {suggestion.alternativeSlots.map((slot, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <RadioGroupItem
                          value={`alt-${index}`}
                          id={`alt-${index}`}
                        />
                        <Label
                          htmlFor={`alt-${index}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium">
                            {format(new Date(slot.date), 'EEE, MMM d')} at{' '}
                            {slot.time}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {slot.reason}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </RadioGroup>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setSuggestion(null)}
                  disabled={isScheduling}
                >
                  Back
                </Button>
                <Button onClick={handleSchedule} disabled={isScheduling}>
                  {isScheduling && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                  Schedule Task
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
