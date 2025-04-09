import React from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Play, Heart, MessageCircle, Share2 } from "lucide-react";
import { useLocation } from "wouter";

interface ReelCardProps {
  reel: {
    id: number;
    title?: string;
    thumbnailUrl?: string;
    videoUrl?: string;
    userId: number;
    user?: {
      username?: string;
      name?: string;
      profilePicture?: string;
    };
  };
  onClick?: () => void;
}

export function ReelCard({ reel, onClick }: ReelCardProps) {
  const [, setLocation] = useLocation();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setLocation("/reels-view");
    }
  };
  
  return (
    <Card className="overflow-hidden flex flex-col h-80 cursor-pointer hover:shadow-lg transition-shadow">
      <div 
        className="relative flex-grow overflow-hidden bg-gray-100"
        onClick={handleClick}
      >
        {/* Thumbnail */}
        <div className="absolute inset-0">
          <img
            src={reel.thumbnailUrl || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=1974&ixlib=rb-4.0.3"}
            alt={reel.title || "Reel"}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        
        {/* Play button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute inset-0 m-auto w-12 h-12 bg-white/25 hover:bg-white/40 backdrop-blur-sm text-white"
          onClick={handleClick}
        >
          <Play className="h-6 w-6" />
        </Button>
        
        {/* User info */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="h-7 w-7 border-2 border-white">
              <AvatarImage 
                src={reel.user?.profilePicture} 
                alt={reel.user?.name || "User"} 
              />
              <AvatarFallback>
                {reel.user?.name?.charAt(0) || reel.user?.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="ml-2 text-sm font-medium text-white truncate max-w-[100px]">
              {reel.user?.name || reel.user?.username || "User"}
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-3">
        <p className="text-sm font-medium truncate mb-2">{reel.title || "Untitled Reel"}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-xs text-gray-500">Just now</span>
        </div>
      </div>
    </Card>
  );
}