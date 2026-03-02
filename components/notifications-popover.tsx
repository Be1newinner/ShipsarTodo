'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell } from 'lucide-react';

export function NotificationsPopover() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  const typeColors = {
    assignment: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completion: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    deadline: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    comment: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all as read
              </Button>
            )}
          </div>

          <ScrollArea className="h-[400px]">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No notifications</p>
              </div>
            ) : (
              <div className="space-y-2 pr-4">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      notification.read
                        ? 'bg-muted/30'
                        : 'bg-primary/10 border border-primary/20'
                    }`}
                    onClick={() => markAsRead(notification._id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">
                            {notification.title}
                          </p>
                          <Badge
                            className={typeColors[notification.type as keyof typeof typeColors]}
                            variant="outline"
                          >
                            {notification.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
