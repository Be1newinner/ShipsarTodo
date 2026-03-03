"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Notification } from "@/lib/types";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PUT" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all reading", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications().then(() => {
        markAllAsRead();
      });
    }
  }, [user]);

  const handleInvite = async (
    notificationId: string,
    action: "accept" | "reject",
  ) => {
    try {
      const res = await fetch("/api/team/respond-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId, action }),
      });

      if (res.ok) {
        toast.success(`Invitation ${action}ed`);
        setNotifications(notifications.filter((n) => n._id !== notificationId));
        if (action === "accept") {
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1000);
        }
      } else {
        const error = await res.json();
        toast.error(error.message || `Failed to ${action} invitation`);
      }
    } catch (error) {
      toast.error(`Failed to ${action} invitation`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Manage your alerts and invitations.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>You have no notifications right now.</p>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification._id}
              className={
                !notification.read ? "border-primary/50 bg-primary/5" : ""
              }
            >
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {notification.title || "Notification"}
                  </CardTitle>
                  <CardDescription>
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{notification.message}</p>
                {notification.type === "team_invite" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleInvite(notification._id, "accept")}
                      className="gap-2"
                    >
                      <Check className="w-4 h-4" /> Accept
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleInvite(notification._id, "reject")}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" /> Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
