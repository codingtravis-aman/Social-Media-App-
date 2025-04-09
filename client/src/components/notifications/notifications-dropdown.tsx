import { useQuery, useMutation } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ThumbsUp, UserPlus, Calendar, MessageSquare, Star } from "lucide-react";
import { Link } from "wouter";

interface NotificationsDropdownProps {
  onClose: () => void;
}

export function NotificationsDropdown({ onClose }: NotificationsDropdownProps) {
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
  });
  
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", "/api/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });
  
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PUT", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return (
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <ThumbsUp className="h-5 w-5 text-white" />
          </div>
        );
      case 'friend_request':
        return (
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center">
            <UserPlus className="h-5 w-5 text-white" />
          </div>
        );
      case 'friend_accepted':
        return (
          <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center">
            <UserPlus className="h-5 w-5 text-white" />
          </div>
        );
      case 'comment':
        return (
          <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-full bg-purple-500 flex items-center justify-center">
            <Star className="h-5 w-5 text-white" />
          </div>
        );
    }
  };
  
  const newNotifications = notifications.filter((notification: any) => !notification.read);
  const olderNotifications = notifications.filter((notification: any) => notification.read);
  
  return (
    <div className="fixed top-14 right-4 bg-white rounded-lg shadow-xl w-full max-w-xs z-50">
      <div className="p-2 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-bold">Notifications</h3>
          <Button 
            variant="link" 
            className="text-primary text-sm font-medium p-0 h-auto"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            Mark all as read
          </Button>
        </div>
        <div className="flex space-x-1">
          <Button variant="default" size="sm" className="rounded-full text-sm font-medium">All</Button>
          <Button variant="ghost" size="sm" className="rounded-full text-sm font-medium">Unread</Button>
        </div>
      </div>
      
      <ScrollArea className="p-2 max-h-96">
        {newNotifications.length > 0 && (
          <>
            <div className="text-xs font-semibold text-gray-500 mb-1 pl-2">New</div>
            
            {newNotifications.map((notification: any) => (
              <div 
                key={notification.id} 
                className="flex items-start space-x-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  markAsReadMutation.mutate(notification.id);
                  onClose();
                }}
              >
                <div className="relative">
                  {getNotificationIcon(notification.type)}
                  {notification.type === 'like' && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                      <ThumbsUp className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p>
                    <Link href={`/profile/${notification.sender?.id}`} onClick={(e) => e.stopPropagation()}>
                      <a className="font-semibold hover:underline">{notification.sender?.name}</a>
                    </Link>
                    {notification.type === 'like' && ' liked your post'}
                    {notification.type === 'comment' && ' commented on your post'}
                    {notification.type === 'friend_request' && ' sent you a friend request'}
                    {notification.type === 'friend_accepted' && ' accepted your friend request'}
                  </p>
                  <p className="text-xs text-gray-500">{formatTime(notification.createdAt)}</p>
                </div>
                <div className="w-3 h-3 bg-primary rounded-full"></div>
              </div>
            ))}
          </>
        )}
        
        {olderNotifications.length > 0 && (
          <>
            <div className="text-xs font-semibold text-gray-500 mt-3 mb-1 pl-2">Earlier</div>
            
            {olderNotifications.map((notification: any) => (
              <div 
                key={notification.id} 
                className="flex items-start space-x-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                onClick={onClose}
              >
                <div className="relative">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <p>
                    <Link href={`/profile/${notification.sender?.id}`} onClick={(e) => e.stopPropagation()}>
                      <a className="font-semibold hover:underline">{notification.sender?.name}</a>
                    </Link>
                    {notification.type === 'like' && ' liked your post'}
                    {notification.type === 'comment' && ' commented on your post'}
                    {notification.type === 'friend_request' && ' sent you a friend request'}
                    {notification.type === 'friend_accepted' && ' accepted your friend request'}
                  </p>
                  <p className="text-xs text-gray-500">{formatTime(notification.createdAt)}</p>
                </div>
              </div>
            ))}
          </>
        )}
        
        {notifications.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-gray-500">No notifications yet</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
