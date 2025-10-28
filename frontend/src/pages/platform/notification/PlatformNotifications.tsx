import React from "react";
import { Bell } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSelector } from "react-redux";
import { selectNotifications } from "@/redux/slices/notificationSlice";
import { HeaderLayout } from "@/components/AppLayout";

export default function PlatformNotifications() {
  const notifications = useSelector(selectNotifications);

  return (
    <div className="space-y-6">
      <HeaderLayout
        breadcrumbs={[
          { label: "Notifications", href: "/platform/notifications" },
          { label: "Platform Notifications" },
        ]}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Platform Notifications
          </h1>
          <p className="text-muted-foreground">
            System-wide notifications and updates
          </p>
        </div>
        <Bell className="h-8 w-8 text-primary" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Notifications</span>
            <Badge variant="secondary">{notifications.length}</Badge>
          </CardTitle>
          <CardDescription>
            Stay updated with platform-wide announcements and system alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <Bell className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {notification.title || "Notification"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {notification.message || "No message"}
                    </p>
                    {notification.timestamp && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                You&apos;re all caught up! Check back later for updates.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
