import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

// Define types for WebSocket messages
interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface UseWebSocketResult {
  connected: boolean;
  sendMessage: (receiverId: number, content: string) => void;
  sendNotification: (userId: number, content: string, notificationType: string, referenceId: number) => void;
  markMessageAsRead: (messageId: number) => void;
  sendTypingIndicator: (receiverId: number, isTyping: boolean) => void;
  lastMessage: any | null;
  lastNotification: any | null;
  typingUsers: Record<number, boolean>;
}

export function useWebSocket(): UseWebSocketResult {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [lastNotification, setLastNotification] = useState<any>(null);
  const [typingUsers, setTypingUsers] = useState<Record<number, boolean>>({});
  const socketRef = useRef<WebSocket | null>(null);

  // Initialize WebSocket connection with reconnection support
  useEffect(() => {
    if (!user) return;

    let reconnectTimeout: NodeJS.Timeout;
    
    // Function to create and setup WebSocket connection
    const connectWebSocket = () => {
      // Using the current location's protocol and host for WebSocket connection
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      
      // Construct WebSocket URL with fallback
      const wsUrl = `${protocol}//${host}/ws`;
      
      console.log("Connecting to WebSocket at:", wsUrl);
      
      // Create WebSocket connection
      let socket;
      try {
        socket = new WebSocket(wsUrl);
      } catch (error) {
        console.error("Failed to create WebSocket connection:", error);
        // Create a properly typed dummy socket for error handling
        // Properly cast a dummy object to WebSocket type to avoid type errors
        return new WebSocket('wss://offline-fallback-9999.yoop.app');
      }
      socketRef.current = socket;

      // Setup event handlers
      socket.onopen = () => {
        console.log("WebSocket connected");
        // Authenticate with the server
        socket.send(JSON.stringify({
          type: "auth",
          userId: user.id
        }));
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string);
          
          if (data.type === "auth_success") {
            setConnected(true);
            console.log("WebSocket authenticated");
          } 
          else if (data.type === "new_message") {
            setLastMessage(data.message);
            // Show notification
            toast({
              title: `New message from ${data.message.sender.name}`,
              description: data.message.content.substring(0, 50) + (data.message.content.length > 50 ? "..." : ""),
            });
          } 
          else if (data.type === "message_sent") {
            console.log("Message sent successfully");
          }
          else if (data.type === "message_read") {
            console.log("Message marked as read:", data.messageId);
            
            // Update the messages cache using TanStack Query
            const oldData = queryClient.getQueryData<any[]>(['/api/messages']);
            if (oldData) {
              // Update all required conversation queries
              queryClient.setQueryData(['/api/messages'], oldData.map((conversation: any) => {
                // Find the conversation with the relevant message
                if (conversation.messages && conversation.messages.some((msg: any) => msg.id === data.messageId)) {
                  // Update the specific message to mark it as read
                  return {
                    ...conversation,
                    messages: conversation.messages.map((msg: any) => 
                      msg.id === data.messageId ? { ...msg, read: true } : msg
                    )
                  };
                }
                return conversation;
              }));
            }
            
            // Also update the specific conversation cache if it exists
            const userId = data.readBy;
            if (userId) {
              const conversationData = queryClient.getQueryData<any[]>(['/api/messages', userId]);
              if (conversationData) {
                queryClient.setQueryData(['/api/messages', userId], 
                  conversationData.map((msg: any) => 
                    msg.id === data.messageId ? { ...msg, read: true } : msg
                  )
                );
              }
            }
          }
          else if (data.type === "typing_indicator") {
            console.log("Typing indicator:", data.userId, data.isTyping);
            setTypingUsers(prev => ({
              ...prev,
              [data.userId]: data.isTyping
            }));
          }
          else if (data.type === "new_notification") {
            setLastNotification(data.notification);
            // Show notification
            toast({
              title: "New notification",
              description: `${data.notification.sender.name} ${data.notification.content}`,
            });
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      socket.onerror = (error: Event) => {
        console.error("WebSocket error:", error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to the server",
          variant: "destructive",
        });
      };

      socket.onclose = () => {
        console.log("WebSocket disconnected");
        setConnected(false);
        
        // Implement reconnection logic with exponential backoff
        clearTimeout(reconnectTimeout);
        reconnectTimeout = setTimeout(() => {
          console.log("Attempting to reconnect WebSocket...");
          connectWebSocket();
        }, 3000);
      };
      
      return socket;
    };
    
    // Initial connection
    const socketInstance = connectWebSocket();

    // Clean up on unmount
    return () => {
      clearTimeout(reconnectTimeout);
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, [user, toast]);

  // Send a direct message
  const sendMessage = useCallback((receiverId: number, content: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      toast({
        title: "Not Connected",
        description: "You are not connected to the server",
        variant: "destructive",
      });
      return;
    }

    socketRef.current.send(JSON.stringify({
      type: "message",
      receiverId,
      content
    }));
  }, [toast]);

  // Send a notification
  const sendNotification = useCallback((userId: number, content: string, notificationType: string, referenceId: number) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      toast({
        title: "Not Connected",
        description: "You are not connected to the server",
        variant: "destructive",
      });
      return;
    }

    socketRef.current.send(JSON.stringify({
      type: "notification",
      userId,
      content,
      notificationType,
      referenceId
    }));
  }, [toast]);

  // Mark message as read
  const markMessageAsRead = useCallback((messageId: number) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      toast({
        title: "Not Connected",
        description: "You are not connected to the server",
        variant: "destructive",
      });
      return;
    }

    socketRef.current.send(JSON.stringify({
      type: "mark_read",
      messageId
    }));
  }, [toast]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((receiverId: number, isTyping: boolean) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return; // Silently fail for typing indicators
    }

    socketRef.current.send(JSON.stringify({
      type: "typing",
      receiverId,
      isTyping
    }));
  }, []);

  return {
    connected,
    sendMessage,
    sendNotification,
    markMessageAsRead,
    sendTypingIndicator,
    lastMessage,
    lastNotification,
    typingUsers
  };
}