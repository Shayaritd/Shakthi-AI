import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bell,
  CheckCheck,
  MessageSquare,
  Award,
  Shield,
  Star,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const notificationIcons: Record<string, any> = {
  MENTORSHIP: MessageSquare,
  SCHOLARSHIP: Award,
  REPORT: Shield,
  VERIFICATION: CheckCheck,
  REWARD: Star,
  ADMIN: Bell,
  CHAT: MessageSquare,
  REMINDER: Calendar,
};

export default function NotificationsPage() {
  const { user } = useAuth();

  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => getNotifications(user!.id),
    enabled: !!user,
  });

  const markAllMutation = useMutation({
    mutationFn: () => markAllNotificationsAsRead(user!.id),
    onSuccess: () => refetch(),
  });

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <Badge className="bg-teal-100 text-teal-700">{unreadCount} new</Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => markAllMutation.mutate()}
          disabled={!unreadCount}
        >
          <CheckCheck className="w-4 h-4 mr-2" />
          Mark all read
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : notifications && notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = notificationIcons[notification.type] || Bell;
            return (
              <Card
                key={notification.id}
                className={`${!notification.read ? 'border-teal-200 bg-teal-50/50' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        !notification.read ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      {notification.action_url && (
                        <Link
                          to={notification.action_url}
                          className="text-sm text-teal-600 hover:text-teal-700 mt-2 inline-block"
                        >
                          View details
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
          <p className="text-gray-500 mt-1">You&apos;re all caught up!</p>
        </div>
      )}
    </div>
  );
}
