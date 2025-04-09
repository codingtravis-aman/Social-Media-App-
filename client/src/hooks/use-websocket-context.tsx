import { createContext, ReactNode, useContext } from "react";
import { useWebSocket, UseWebSocketResult } from "./use-websocket";

// Create WebSocket context
const WebSocketContext = createContext<UseWebSocketResult | null>(null);

// WebSocket provider component
export function WebSocketProvider({ children }: { children: ReactNode }) {
  const webSocketState = useWebSocket();
  
  return (
    <WebSocketContext.Provider value={webSocketState}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Hook to use the WebSocket context
export function useWebSocketContext(): UseWebSocketResult {
  const context = useContext(WebSocketContext);
  
  if (!context) {
    throw new Error("useWebSocketContext must be used within a WebSocketProvider");
  }
  
  return context;
}