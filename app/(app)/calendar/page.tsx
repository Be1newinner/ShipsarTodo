'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarMonthView } from '@/components/calendar-month-view';
import { CalendarWeekView } from '@/components/calendar-week-view';
import { UpcomingTodos } from '@/components/upcoming-todos';
import { useTodos } from '@/hooks/useTodos';
import { showSuccess, showError } from '@/lib/toast-utils';
import { apiPut } from '@/lib/api';

export default function CalendarPage() {
  const { todos, isLoading, mutate } = useTodos();
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const handleTodoDrop = async (todoId: string, date: Date) => {
    try {
      await apiPut(`/todos/schedule`, {
        todoId,
        scheduledDate: date.toISOString(),
      });
      await mutate();
      showSuccess('Todo rescheduled successfully');
    } catch (error) {
      showError('Failed to reschedule todo', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Calendar</h1>
        <p className="text-muted-foreground">
          Plan and schedule your tasks with drag-and-drop scheduling
        </p>
      </div>

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'month' | 'week')}>
        <TabsList>
          <TabsTrigger value="month">Month View</TabsTrigger>
          <TabsTrigger value="week">Week View</TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="space-y-6">
          <div className="bg-card border border-border/50 rounded-lg p-6">
            <CalendarMonthView
              todos={todos}
              onTodoDrop={handleTodoDrop}
            />
          </div>
          <UpcomingTodos todos={todos} />
        </TabsContent>

        <TabsContent value="week" className="space-y-6">
          <div className="bg-card border border-border/50 rounded-lg p-6">
            <CalendarWeekView
              todos={todos}
              onTodoDrop={handleTodoDrop}
            />
          </div>
          <UpcomingTodos todos={todos} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
