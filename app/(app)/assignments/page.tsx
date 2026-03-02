'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { showSuccess, showError } from '@/lib/toast-utils';
import { apiGet, apiPatch } from '@/lib/api';
import { Loader, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Assignment {
  _id: string;
  todoId: string;
  assignedBy: string;
  assignedTo: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  delegationMessage: string;
  createdAt: string;
  updatedAt: string;
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResponding, setIsResponding] = useState<string | null>(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setIsLoading(true);
    try {
      const data = await apiGet<Assignment[]>('/assignments');
      setAssignments(data);
    } catch (error) {
      showError('Failed to load assignments', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async (
    assignmentId: string,
    status: 'accepted' | 'rejected'
  ) => {
    setIsResponding(assignmentId);
    try {
      await apiPatch(`/assignments/${assignmentId}`, { status });
      await loadAssignments();
      showSuccess(
        `Assignment ${status === 'accepted' ? 'accepted' : 'rejected'}`
      );
    } catch (error) {
      showError('Failed to respond to assignment', error);
    } finally {
      setIsResponding(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const pendingAssignments = assignments.filter((a) => a.status === 'pending');
  const respondedAssignments = assignments.filter((a) => a.status !== 'pending');

  return (
    <div className="flex-1 space-y-8 p-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Assignments</h1>
        <p className="text-muted-foreground">
          View and manage tasks delegated to you
        </p>
      </div>

      {/* Pending Assignments */}
      {pendingAssignments.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-200">
              <Clock className="w-5 h-5" />
              Pending Assignments ({pendingAssignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingAssignments.map((assignment) => (
              <div
                key={assignment._id}
                className="p-4 bg-card border rounded-lg space-y-3"
              >
                <div>
                  <p className="font-semibold">Task {assignment.todoId}</p>
                  {assignment.delegationMessage && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {assignment.delegationMessage}
                    </p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Assigned {format(new Date(assignment.createdAt), 'MMM d, yyyy')}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRespond(assignment._id, 'rejected')}
                    disabled={isResponding === assignment._id}
                  >
                    {isResponding === assignment._id && (
                      <Loader className="w-3 h-3 mr-1 animate-spin" />
                    )}
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleRespond(assignment._id, 'accepted')}
                    disabled={isResponding === assignment._id}
                  >
                    {isResponding === assignment._id && (
                      <Loader className="w-3 h-3 mr-1 animate-spin" />
                    )}
                    Accept
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Responded Assignments */}
      {respondedAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Assignment History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {respondedAssignments.map((assignment) => (
              <div key={assignment._id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Task {assignment.todoId}</p>
                  <Badge
                    variant={assignment.status === 'accepted' ? 'default' : 'destructive'}
                  >
                    {assignment.status.charAt(0).toUpperCase() +
                      assignment.status.slice(1)}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {assignment.status === 'accepted'
                    ? 'Accepted'
                    : 'Declined'}{' '}
                  {format(new Date(assignment.updatedAt), 'MMM d, yyyy')}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {assignments.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No assignments yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
