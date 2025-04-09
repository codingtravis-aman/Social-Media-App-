import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useWebSocketContext } from "@/hooks/use-websocket-context";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Check, CheckCheck } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
  recipientId: number;
  recipientName: string;
  recipientAvatar?: string;
}

export default function ChatWindow({ recipientId, recipientName, recipientAvatar }: ChatWindowProps) {
  const { user } = useAuth();
  const { sendMessage, connected, markMessageAsRead, sendTypingIndicator, typingUsers } = useWebSocketContext();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch conversation
  const { data: messages, isLoading } = useQuery({
    queryKey: ['/api/messages', recipientId],
    queryFn: () => apiRequest('GET', `/api/messages/${recipientId}`).then(res => res.json()),
    enabled: !!recipientId,
  });
  
  // Handle message submission
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest('POST', '/api/messages', {
        receiverId: recipientId,
        content
      });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['/api/messages', recipientId] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      setMessage("");
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Scroll to bottom of chat on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Mark incoming messages as read
  useEffect(() => {
    if (!messages || !connected || !user) return;
    
    // Find unread messages from the recipient that we haven't read yet
    const unreadMessages = messages.filter(
      (msg: any) => msg.senderId === recipientId && !msg.read
    );
    
    // Mark each message as read
    unreadMessages.forEach((msg: any) => {
      markMessageAsRead(msg.id);
    });
  }, [messages, connected, recipientId, user, markMessageAsRead]);
  
  // Handle typing indicators
  useEffect(() => {
    if (!connected) return;
    
    const handleTyping = () => {
      sendTypingIndicator(recipientId, true);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set a new timeout to clear typing indicator after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(recipientId, false);
      }, 3000);
    };
    
    if (message.length > 0) {
      handleTyping();
    } else {
      // If message is empty, stop typing indicator
      sendTypingIndicator(recipientId, false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
    
    // Cleanup
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, connected, recipientId, sendTypingIndicator]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Stop typing indicator when sending
    sendTypingIndicator(recipientId, false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Use WebSocket if connected, otherwise use REST API
    if (connected) {
      sendMessage(recipientId, message);
      setMessage("");
    } else {
      sendMessageMutation.mutate(message);
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="border-b pb-3">
        <CardTitle className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={recipientAvatar} />
            <AvatarFallback>{getInitials(recipientName)}</AvatarFallback>
          </Avatar>
          <span>{recipientName}</span>
          {connected && (
            <span className="ml-2 h-2 w-2 rounded-full bg-green-500" title="Connected via WebSocket" />
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow p-4 overflow-hidden">
        <ScrollArea className="h-[420px] pr-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : messages && messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((msg: any) => {
                const isMine = msg.senderId === user?.id;
                
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        isMine
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <div className={`flex items-center justify-between text-xs mt-1 ${
                        isMine ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      }`}>
                        <span>{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}</span>
                        {isMine && (
                          <span className="ml-2">
                            {msg.read ? (
                              <CheckCheck className="h-3 w-3 inline" aria-label="Read" />
                            ) : (
                              <Check className="h-3 w-3 inline" aria-label="Sent" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Typing indicator */}
              {connected && typingUsers[recipientId] && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-2 bg-muted">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messageEndRef} />
            </div>
          ) : (
            <div className="flex justify-center items-center h-full text-muted-foreground">
              No messages yet. Start a conversation!
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="border-t pt-3">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={sendMessageMutation.isPending}
            className="flex-grow"
          />
          <Button type="submit" size="icon" disabled={sendMessageMutation.isPending || !message.trim()}>
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}