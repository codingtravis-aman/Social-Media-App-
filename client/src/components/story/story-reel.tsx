import { useQuery } from "@tanstack/react-query";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { StoryCard } from "./story-card";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function StoryReel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [content, setContent] = useState("");
  
  const { data: storiesData, isLoading } = useQuery({
    queryKey: ["/api/stories"],
    enabled: !!user,
  });
  
  const createStoryMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/stories", {
        content,
        image: imageUrl,
      });
    },
    onSuccess: () => {
      setContent("");
      setImageUrl("");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      toast({
        title: "Story created",
        description: "Your story has been published successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating story",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });
  
  const handleCreate = () => {
    if (!imageUrl.trim()) {
      toast({
        title: "Image required",
        description: "Please provide an image URL for your story.",
        variant: "destructive",
      });
      return;
    }
    
    createStoryMutation.mutate();
  };
  
  if (isLoading) {
    return <div className="h-48 bg-white rounded-lg shadow animate-pulse mb-4"></div>;
  }
  
  return (
    <div className="mb-4">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-2 py-4">
          {/* Create Story Card */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <div className="flex-shrink-0 relative bg-white rounded-xl shadow w-32 h-48 cursor-pointer">
                <div className="h-3/4 overflow-hidden rounded-t-xl bg-gray-200">
                  <img 
                    src={user?.profilePicture} 
                    alt={user?.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-primary rounded-full border-4 border-white flex items-center justify-center">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div className="absolute bottom-2 left-0 right-0 text-center">
                  <p className="text-sm font-medium">Create Story</p>
                </div>
              </div>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Story</DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user?.profilePicture} alt={user?.name} />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500">Your story will be visible for 24 hours</p>
                  </div>
                </div>
                
                <Input
                  placeholder="Add a caption to your story (optional)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                
                <Input
                  placeholder="Image URL (required)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                
                {imageUrl && (
                  <div className="relative rounded-lg overflow-hidden h-64">
                    <img 
                      src={imageUrl} 
                      alt="Story preview" 
                      className="w-full h-full object-cover" 
                      onError={() => {
                        toast({
                          title: "Invalid image",
                          description: "The image URL is invalid or inaccessible.",
                          variant: "destructive",
                        });
                        setImageUrl("");
                      }}
                    />
                  </div>
                )}
                
                <Button 
                  onClick={handleCreate}
                  disabled={!imageUrl.trim() || createStoryMutation.isPending}
                >
                  {createStoryMutation.isPending ? "Creating..." : "Share to Story"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Stories list */}
          {storiesData?.map((userStories) => (
            <StoryCard
              key={userStories.user.id}
              user={userStories.user}
              story={userStories.stories[0]}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
