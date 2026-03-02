'use client';

import { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Todo } from '@/lib/types';
import {
  getCalendarDays,
  assignTodosToCalendarDays,
  CalendarDay,
} from '@/lib/calendar-utils';

interface CalendarMonthViewProps {
  todos: Todo[];
  onDateSelect?: (date: Date) => void;
  onTodoDrop?: (todoId: string, date: Date) => void;
}

export function CalendarMonthView({
  todos,
  onDateSelect,
  onTodoDrop,
}: CalendarMonthViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const days = assignTodosToCalendarDays(getCalendarDays(currentDate), todos);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeks = Array.from({ length: Math.ceil(days.length / 7) }, (_, i) =>
    days.slice(i * 7, (i + 1) * 7)
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Week Day Headers */}
        <div className="grid grid-cols-7 bg-muted">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-4 text-center font-semibold text-sm"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-t">
            {week.map((day, dayIndex) => (
              <CalendarDayCell
                key={dayIndex}
                day={day}
                onDateSelect={onDateSelect}
                onTodoDrop={onTodoDrop}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

interface CalendarDayCellProps {
  day: CalendarDay;
  onDateSelect?: (date: Date) => void;
  onTodoDrop?: (todoId: string, date: Date) => void;
}

function CalendarDayCell({
  day,
  onDateSelect,
  onTodoDrop,
}: CalendarDayCellProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.id && onTodoDrop) {
        onTodoDrop(data.id, day.date);
      }
    } catch {
      // Invalid drag data
    }
  };

  return (
    <div
      data-date={day.date.toISOString()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => onDateSelect?.(day.date)}
      className={`min-h-24 p-2 border-r border-b cursor-pointer transition-colors ${
        !day.isCurrentMonth ? 'bg-muted' : ''
      } ${isDragOver ? 'bg-primary/10' : ''} ${
        day.isToday ? 'bg-accent/5' : ''
      }`}
    >
      <div
        className={`text-sm font-semibold mb-1 ${
          day.isToday
            ? 'text-primary'
            : day.isCurrentMonth
              ? 'text-foreground'
              : 'text-muted-foreground'
        }`}
      >
        {format(day.date, 'd')}
      </div>
      <div className="space-y-1">
        {day.todos.slice(0, 2).map((todo) => (
          <div
            key={todo._id}
            className="text-xs bg-primary/10 text-primary p-1 rounded truncate"
            onClick={(e) => e.stopPropagation()}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData(
                'application/json',
                JSON.stringify({ id: todo._id })
              );
            }}
          >
            {todo.title}
          </div>
        ))}
        {day.todos.length > 2 && (
          <div className="text-xs text-muted-foreground">
            +{day.todos.length - 2} more
          </div>
        )}
      </div>
    </div>
  );
}
