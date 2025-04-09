import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface StoryCardProps {
  user: any;
  story: any;
}

export function StoryCard({ user, story }: StoryCardProps) {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <div 
        className="flex-shrink-0 relative rounded-xl shadow w-32 h-48 cursor-pointer overflow-hidden"
        onClick={() => setOpen(true)}
      >
        <img 
          src={story.image} 
          alt="Story" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute top-2 left-2 w-10 h-10 rounded-full border-4 border-primary overflow-hidden">
          <Avatar className="w-full h-full">
            <AvatarImage src={user.profilePicture} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-white text-sm font-medium">{user.name}</p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60"></div>
      </div>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden max-h-[90vh]">
          <div className="relative h-[80vh]">
            <img 
              src={story.image} 
              alt="Story fullscreen" 
              className="w-full h-full object-cover" 
            />
            
            <div className="absolute top-4 left-4 flex items-center space-x-2">
              <Avatar className="w-10 h-10 border-2 border-white">
                <AvatarImage src={user.profilePicture} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-medium">{user.name}</p>
                <p className="text-white text-xs opacity-80">
                  {new Date(story.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            
            {story.content && (
              <div className="absolute bottom-4 left-0 right-0 text-center px-4">
                <p className="text-white text-lg font-medium">{story.content}</p>
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none"></div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
