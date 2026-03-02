'use client';

import { useState, useEffect } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { showSuccess, showError } from '@/lib/toast-utils';
import { apiPost, apiGet } from '@/lib/api';
import { Loader, Send } from 'lucide-react';

interface TeamMember {
  _id: string;
  email: string;
  name: string;
  role: string;
}

interface DelegationModalProps {
  todo: Todo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelegated?: () => void;
}

export function DelegationModal({
  todo,
  open,
  onOpenChange,
  onDelegated,
}: DelegationModalProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDelegating, setIsDelegating] = useState(false);

  useEffect(() => {
    if (open) {
      loadTeamMembers();
    }
  }, [open]);

  const loadTeamMembers = async () => {
    setIsLoading(true);
    try {
      const team = await apiGet<any>('/team');
      setTeamMembers(team.members || []);
    } catch (error) {
      showError('Failed to load team members', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelegate = async () => {
    if (!selectedMember || !message.trim()) {
      showError('Please select a member and add a message');
      return;
    }

    setIsDelegating(true);
    try {
      await apiPost('/assignments', {
        todoId: todo._id,
        assignedTo: selectedMember,
        delegationMessage: message,
      });
      showSuccess('Task delegated successfully');
      onOpenChange(false);
      onDelegated?.();
    } catch (error) {
      showError('Failed to delegate task', error);
    } finally {
      setIsDelegating(false);
    }
  };

  const otherMembers = teamMembers.filter((m) => m.role !== 'owner');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delegate Task</DialogTitle>
          <DialogDescription>
            Assign this task to a team member
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">{todo.title}</h4>
            {todo.description && (
              <p className="text-sm text-muted-foreground">{todo.description}</p>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-4 h-4 animate-spin" />
            </div>
          ) : otherMembers.length === 0 ? (
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                No team members available. Add team members first to delegate tasks.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Team Member Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Assign to
                </label>
                <Select value={selectedMember} onValueChange={setSelectedMember}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member..." />
                  </SelectTrigger>
                  <SelectContent>
                    {otherMembers.map((member) => (
                      <SelectItem key={member._id} value={member._id}>
                        <div className="flex items-center gap-2">
                          <span>{member.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {member.email}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Task Details */}
              {selectedMember && (
                <div className="p-3 bg-muted rounded-lg space-y-2">
                  <div className="text-sm font-medium">Task Details</div>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <div>Priority: <Badge variant="outline">{todo.priority}</Badge></div>
                    {todo.estimatedMinutes && (
                      <div>Estimated: {todo.estimatedMinutes} minutes</div>
                    )}
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Delegation Message
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain the task and any important notes..."
                  className="min-h-24"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isDelegating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelegate}
                  disabled={isDelegating || !selectedMember}
                >
                  {isDelegating && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                  <Send className="w-4 h-4 mr-2" />
                  Delegate
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
