import { startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isPast, isToday } from 'date-fns';
import { Todo } from '@/lib/types';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  todos: Todo[];
}

export function getCalendarDays(date: Date): CalendarDay[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  
  // Get start of the first week (might be from previous month)
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(calendarStart.getDate() - monthStart.getDay());
  
  // Get end of the last week (might be from next month)
  const calendarEnd = new Date(monthEnd);
  calendarEnd.setDate(calendarEnd.getDate() + (6 - monthEnd.getDay()));
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  return days.map(day => ({
    date: day,
    isCurrentMonth: isSameMonth(day, date),
    isToday: isToday(day),
    todos: [],
  }));
}

export function assignTodosToCalendarDays(days: CalendarDay[], todos: Todo[]): CalendarDay[] {
  return days.map(day => ({
    ...day,
    todos: todos.filter(todo => 
      todo.dueDate && isSameDay(new Date(todo.dueDate), day.date)
    ),
  }));
}

export function getWeekView(startDate: Date): CalendarDay[] {
  const days: CalendarDay[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    days.push({
      date,
      isCurrentMonth: true,
      isToday: isToday(date),
      todos: [],
    });
  }
  return days;
}

export function getDayView(date: Date): CalendarDay {
  return {
    date,
    isCurrentMonth: true,
    isToday: isToday(date),
    todos: [],
  };
}

export function getTodosForDateRange(todos: Todo[], startDate: Date, endDate: Date): Todo[] {
  return todos.filter(todo => {
    if (!todo.dueDate) return false;
    const todoDate = new Date(todo.dueDate);
    return todoDate >= startDate && todoDate <= endDate;
  });
}

export function getUpcomingTodos(todos: Todo[], days: number = 7): Todo[] {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return todos
    .filter(todo => 
      todo.dueDate && 
      new Date(todo.dueDate) >= now && 
      new Date(todo.dueDate) <= futureDate &&
      todo.status !== 'completed'
    )
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
}

export function getOverdueTodos(todos: Todo[]): Todo[] {
  const now = new Date();
  return todos.filter(todo => 
    todo.dueDate && 
    isPast(new Date(todo.dueDate)) && 
    !isToday(new Date(todo.dueDate)) &&
    todo.status !== 'completed'
  );
}

export function getOptimalScheduleTime(estimatedMinutes: number, workStart: number = 9, workEnd: number = 17): string {
  const randomHour = Math.floor(Math.random() * (workEnd - workStart)) + workStart;
  const randomMinute = Math.floor(Math.random() * 60);
  return `${String(randomHour).padStart(2, '0')}:${String(randomMinute).padStart(2, '0')}`;
}
