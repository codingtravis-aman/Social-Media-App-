import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AnimatePresence } from "framer-motion";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile-page";
import MessagesPage from "@/pages/messages-page";
import WatchPage from "@/pages/watch-page";
import ReelsViewPage from "@/pages/reels-view-page";
import MarketplacePage from "@/pages/marketplace-page";
import GroupsPage from "@/pages/groups-page";
import GamingPage from "@/pages/gaming-page";
import MemoriesPage from "@/pages/memories-page";
import SavedPage from "@/pages/saved-page";
import EventsPage from "@/pages/events-page";
import FriendsPage from "@/pages/friends-page";
import CollectionDetailPage from "@/pages/collection-detail-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import { WebSocketProvider } from "@/hooks/use-websocket-context";
import DynamicMetadata from "@/components/seo/dynamic-metadata";
import { useEffect } from "react";

function Router() {
  const [location] = useLocation();
  
  // Update page title based on location
  useEffect(() => {
    const pageName = location === '/' 
      ? 'Home' 
      : location.substring(1).split('/')[0]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
        
    document.title = pageName ? `${pageName} | Yoop` : 'Yoop';
  }, [location]);
  
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/profile/:id" component={ProfilePage} />
      <ProtectedRoute path="/messages" component={MessagesPage} />
      <ProtectedRoute path="/watch" component={WatchPage} />
      <ProtectedRoute path="/reels-view" component={ReelsViewPage} />
      <ProtectedRoute path="/marketplace" component={MarketplacePage} />
      <ProtectedRoute path="/groups" component={GroupsPage} />
      <ProtectedRoute path="/gaming" component={GamingPage} />
      <ProtectedRoute path="/memories" component={MemoriesPage} />
      <ProtectedRoute path="/saved" component={SavedPage} />
      <ProtectedRoute path="/collections/:id" component={CollectionDetailPage} />
      <ProtectedRoute path="/events" component={EventsPage} />
      <ProtectedRoute path="/friends" component={FriendsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WebSocketProvider>
          {/* Default SEO metadata */}
          <DynamicMetadata 
            title="Connect, Share, Discover"
            description="Join Yoop, the social media platform where you can connect with friends, share moments, and discover exciting content tailored to your interests."
            type="website"
          />
          <Router />
          <Toaster />
        </WebSocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
