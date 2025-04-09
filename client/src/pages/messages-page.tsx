import { useWebSocketContext } from "@/hooks/use-websocket-context";
import ConversationsList from "@/components/chat/conversations-list";
import { Badge } from "@/components/ui/badge";

export default function MessagesPage() {
  const { connected } = useWebSocketContext();
  
  return (
    <div className="container max-w-7xl py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground mt-1">
            Chat with your friends and connections
          </p>
        </div>
        
        <Badge variant={connected ? "default" : "outline"}>
          {connected ? "WebSocket Connected" : "Using REST API"}
        </Badge>
      </div>
      
      <div className="my-6">
        <ConversationsList />
      </div>
    </div>
  );
}