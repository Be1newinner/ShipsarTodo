"use client";

import { format, isPast, isToday as isTodayDate } from "date-fns";
import { AlertCircle, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Todo } from "@/hooks/useTodos";
import { getUpcomingTodos, getOverdueTodos } from "@/lib/calendar-utils";

interface UpcomingTodosProps {
  todos: Todo[];
}

export function UpcomingTodos({ todos }: UpcomingTodosProps) {
  const upcomingTodos = getUpcomingTodos(todos);
  const overdueTodos = getOverdueTodos(todos);

  return (
    <div className="space-y-4">
      {/* Overdue Section */}
      {overdueTodos.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-200">
              <AlertCircle className="w-5 h-5" />
              Overdue ({overdueTodos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdueTodos.map((todo) => (
              <TodoItem key={todo._id} todo={todo} isOverdue={true} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Section */}
      {upcomingTodos.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Upcoming ({upcomingTodos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingTodos.map((todo) => (
              <TodoItem key={todo._id} todo={todo} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {upcomingTodos.length === 0 && overdueTodos.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <p className="text-muted-foreground">No upcoming tasks</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TodoItem({ todo, isOverdue }: { todo: Todo; isOverdue?: boolean }) {
  const isToday = todo.dueDate && isTodayDate(new Date(todo.dueDate));
  const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;

  const priorityColors = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    medium:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border ${
        isOverdue
          ? "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
          : "bg-card border-border"
      }`}
    >
      <input
        type="checkbox"
        defaultChecked={todo.status === "completed"}
        disabled
        className="mt-1 w-4 h-4"
      />
      <div className="flex-1 min-w-0">
        <div
          className={`font-medium truncate ${
            todo.status === "completed"
              ? "line-through text-muted-foreground"
              : ""
          }`}
        >
          {todo.title}
        </div>
        {dueDate && (
          <div
            className={`text-sm ${
              isOverdue
                ? "text-red-700 dark:text-red-200"
                : isToday
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-muted-foreground"
            }`}
          >
            {isToday
              ? "Today"
              : "Tomorrow" === format(dueDate, "EEEE")
                ? "Tomorrow"
                : format(dueDate, "MMM d")}
          </div>
        )}
      </div>
      <div className="flex gap-1">
        <Badge className={priorityColors[todo.priority]}>
          {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
        </Badge>
        {todo.completionProbability !== undefined && (
          <Badge variant="outline">
            {Math.round(todo.completionProbability * 100)}%
          </Badge>
        )}
      </div>
    </div>
  );
}
