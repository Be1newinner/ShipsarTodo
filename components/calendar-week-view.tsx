'use client';

import { useState } from 'react';
import { format, addWeeks, subWeeks, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Todo } from '@/lib/types';
import { getWeekView } from '@/lib/calendar-utils';

interface CalendarWeekViewProps {
  todos: Todo[];
  onTodoDrop?: (todoId: string, date: Date) => void;
}

export function CalendarWeekView({ todos, onTodoDrop }: CalendarWeekViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekStart = startOfWeek(currentDate);
  const days = getWeekView(weekStart);

  const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

  const hours = Array.from({ length: 12 }, (_, i) => 9 + i);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          Week of {format(weekStart, 'MMM d, yyyy')}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="border rounded-lg overflow-x-auto">
        <div className="grid gap-0" style={{ gridTemplateColumns: `60px repeat(7, 1fr)` }}>
          {/* Time Column Header */}
          <div className="sticky left-0 bg-muted border-r"></div>

          {/* Day Headers */}
          {days.map((day) => (
            <div
              key={day.date.toISOString()}
              className="p-3 border-r border-b bg-muted text-center"
            >
              <div className="font-semibold">{format(day.date, 'EEE')}</div>
              <div className="text-sm text-muted-foreground">
                {format(day.date, 'd')}
              </div>
            </div>
          ))}

          {/* Time Rows */}
          {hours.map((hour) => (
            <div key={`row-${hour}`} className="contents">
              <div className="sticky left-0 p-2 text-sm text-muted-foreground bg-muted border-r border-b text-right">
                {String(hour).padStart(2, '0')}:00
              </div>
              {days.map((day) => {
                const dayTodos = todos.filter((todo) => {
                  if (!todo.scheduledDate) return false;
                  const todoDate = new Date(todo.scheduledDate);
                  return (
                    todoDate.toDateString() === day.date.toDateString()
                  );
                });

                return (
                  <div
                    key={`${day.date}-${hour}`}
                    data-date={day.date.toISOString()}
                    className="min-h-16 border-r border-b p-1 hover:bg-accent/5 transition-colors relative group"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      try {
                        const data = JSON.parse(
                          e.dataTransfer.getData('application/json')
                        );
                        if (data.id && onTodoDrop) {
                          const newDate = new Date(day.date);
                          newDate.setHours(hour, 0, 0, 0);
                          onTodoDrop(data.id, newDate);
                        }
                      } catch {
                        // Invalid drag data
                      }
                    }}
                  >
                    {dayTodos.map((todo) => (
                      <div
                        key={todo._id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = 'move';
                          e.dataTransfer.setData(
                            'application/json',
                            JSON.stringify({ id: todo._id })
                          );
                        }}
                        className="bg-primary/20 text-primary text-xs p-1 rounded mb-1 cursor-move hover:bg-primary/30"
                      >
                        <div className="font-semibold truncate">{todo.title}</div>
                        {todo.estimatedMinutes && (
                          <div className="text-xs opacity-75">
                            {todo.estimatedMinutes}min
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
