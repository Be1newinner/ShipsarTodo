'use client';

import useSWR from 'swr';
import { Notification } from '@/lib/types';
import { apiGet, apiPatch } from '@/lib/api';

export function useNotifications() {
  const { data: notifications = [], isLoading, mutate } = useSWR<Notification[]>(
    '/notifications',
    () => apiGet<Notification[]>('/notifications')
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (notificationId: string) => {
    try {
      await apiPatch('/notifications', { notificationId });
      await mutate();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const promises = notifications
        .filter((n) => !n.read)
        .map((n) => markAsRead(n._id));
      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  };
}
