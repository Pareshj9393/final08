// components/pages/NotificationsPage.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { Notification, supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Bell, Heart, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

interface NotificationsPageProps {
  user: User | null;
}

// We need to extend the Notification type to include the joined profile data
type NotificationWithActor = Notification & {
    profiles: {
        username: string;
        avatar_url: string;
    }
}

export default function NotificationsPage({ user }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<NotificationWithActor[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`*, profiles:actor_id(*)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data as NotificationWithActor[] || []);
    } catch (error) {
      toast.error('Could not fetch notifications.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);
        if (error) throw error;
        setNotifications(notifications.map(n => n.id === notificationId ? {...n, is_read: true} : n));
    } catch (error) {
        toast.error('Failed to mark notification as read.');
    }
  };

  const handleNotificationClick = (notification: NotificationWithActor) => {
    handleMarkAsRead(notification.id);
    if(notification.post_id) {
        router.push(`/?page=feed&post=${notification.post_id}`);
    }
  }

  const getNotificationMessage = (notification: NotificationWithActor) => {
    const actor = notification.profiles.username;
    switch(notification.type) {
        case 'like':
            return <><span className="font-semibold">{actor}</span> liked your post.</>
        case 'comment':
            return <><span className="font-semibold">{actor}</span> commented on your post.</>
        default:
            return 'New notification';
    }
  }
  
  const getNotificationIcon = (type: string) => {
    switch(type) {
        case 'like':
            return <Heart className="w-5 h-5 text-red-500 fill-current" />;
        case 'comment':
            return <MessageCircle className="w-5 h-5 text-blue-500" />;
        default:
            return <Bell className="w-5 h-5 text-gray-500" />;
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Bell className="w-8 h-8 mr-3 text-blue-600" />
            Notifications
          </CardTitle>
          <CardDescription>Your recent activity and updates.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading notifications...</p>
          ) : notifications.length > 0 ? (
            <div className="space-y-2">
              {notifications.map(notification => (
                <div 
                    key={notification.id} 
                    className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer ${notification.is_read ? 'bg-white' : 'bg-blue-50'}`}
                    onClick={() => handleNotificationClick(notification)}
                >
                    <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                    </div>
                    <Avatar>
                        <AvatarImage src={notification.profiles.avatar_url} />
                        <AvatarFallback>{notification.profiles.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="text-sm">{getNotificationMessage(notification)}</p>
                        <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</p>
                    </div>
                    {!notification.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">You have no new notifications.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
