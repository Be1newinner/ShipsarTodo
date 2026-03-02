'use client';

import { Todo } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';

interface DashboardStatsProps {
  todos: Todo[];
}

export function DashboardStats({ todos }: DashboardStatsProps) {
  const total = todos.length;
  const completed = todos.filter((t) => t.status === 'completed').length;
  const pending = todos.filter((t) => t.status === 'pending').length;
  const inProgress = todos.filter((t) => t.status === 'in_progress').length;
  const highPriority = todos.filter((t) => t.priority === 'high').length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const avgCompletionProbability =
    todos.length > 0
      ? Math.round(
          (todos.reduce((sum, t) => sum + (t.completionProbability || 0), 0) /
            todos.length) *
            100
        )
      : 0;

  // Generate mock data for chart (last 7 days)
  const chartData = Array.from({ length: 7 }, (_, i) => ({
    day: `Day ${i + 1}`,
    completed: Math.floor(Math.random() * (completed + 1)),
  }));

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="text-3xl font-bold">{total}</div>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-green-700 dark:text-green-200">
                  {completed}
                </div>
                <p className="text-sm text-green-600 dark:text-green-300">Completed</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-300 mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-950">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-200">
                  {inProgress}
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-300">In Progress</p>
              </div>
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-300 mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-200">
                  {pending}
                </div>
                <p className="text-sm text-yellow-600 dark:text-yellow-300">Pending</p>
              </div>
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-300 mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-red-700 dark:text-red-200">
                  {highPriority}
                </div>
                <p className="text-sm text-red-600 dark:text-red-300">High Priority</p>
              </div>
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-300 mt-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h3 className="font-semibold">Completion Rate</h3>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{completionRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h3 className="font-semibold">Avg. Completion Probability</h3>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${avgCompletionProbability}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{avgCompletionProbability}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completion Trend */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4">Completion Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-primary)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
