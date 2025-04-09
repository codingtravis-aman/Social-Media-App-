import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import ChatWindow from "./chat-window";

export default function ConversationsList() {
  const [selectedRecipient, setSelectedRecipient] = useState<any>(null);
  
  // Fetch conversations
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['/api/messages'],
    queryFn: async () => {
      const res = await fetch('/api/messages');
      if (!res.ok) throw new Error('Failed to fetch conversations');
      return res.json();
    },
  });
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  // Calculate a truncated message preview
  const getMessagePreview = (message: string) => {
    return message.length > 30
      ? `${message.substring(0, 30)}...`
      : message;
  };
  
  return (
    <div className="flex h-[700px] border rounded-lg">
      {/* Conversations sidebar */}
      <div className="w-1/3 border-r">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-[600px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : conversations && conversations.length > 0 ? (
          <ScrollArea className="h-[640px]">
            {conversations.map((conversation: any) => (
              <div
                key={conversation.user.id}
                className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedRecipient?.id === conversation.user.id ? 'bg-muted' : ''
                }`}
                onClick={() => setSelectedRecipient(conversation.user)}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={conversation.user.profilePicture} />
                    <AvatarFallback>{getInitials(conversation.user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium truncate">{conversation.user.name}</h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {getMessagePreview(conversation.lastMessage.content)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        ) : (
          <div className="flex justify-center items-center h-[600px] text-muted-foreground">
            No conversations yet
          </div>
        )}
      </div>
      
      {/* Chat window */}
      <div className="flex-1">
        {selectedRecipient ? (
          <ChatWindow
            recipientId={selectedRecipient.id}
            recipientName={selectedRecipient.name}
            recipientAvatar={selectedRecipient.profilePicture}
          />
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-center p-8 text-muted-foreground">
            <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
            <p>Choose a conversation from the list to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}