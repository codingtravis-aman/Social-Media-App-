import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { Video, Image, SmilePlus, Globe, Lock, Users, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Visibility = 'public' | 'friends' | 'private';

export function CreatePost() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  
  const createPostMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/posts", {
        content,
        image: imageUrl || undefined,
        visibility,
      });
    },
    onSuccess: () => {
      setContent("");
      setImageUrl("");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post created",
        description: "Your post has been published successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating post",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });
  
  const getVisibilityIcon = () => {
    switch (visibility) {
      case 'public':
        return <Globe className="h-4 w-4" />;
      case 'friends':
        return <Users className="h-4 w-4" />;
      case 'private':
        return <Lock className="h-4 w-4" />;
    }
  };
  
  const getVisibilityText = () => {
    switch (visibility) {
      case 'public':
        return 'Public';
      case 'friends':
        return 'Friends';
      case 'private':
        return 'Only me';
    }
  };
  
  const handleSubmit = () => {
    if (!content.trim() && !imageUrl.trim()) {
      toast({
        title: "Empty post",
        description: "Please add some content or an image to your post.",
        variant: "destructive",
      });
      return;
    }
    
    createPostMutation.mutate();
  };
  
  return (
    <>
      <div className="bg-white rounded-lg shadow mb-4 p-3 md:p-4">
        <div className="flex items-center space-x-2">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.profilePicture} alt={user?.name} />
            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Input
                placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`}
                className="bg-gray-100 rounded-full py-2 px-4 flex-grow text-sm hover:bg-gray-200 cursor-pointer"
                readOnly
              />
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center">Create Post</DialogTitle>
              </DialogHeader>
              
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user?.profilePicture} alt={user?.name} />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{user?.name}</h4>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="bg-gray-200 rounded-md px-2 py-1 text-xs flex items-center space-x-1 cursor-pointer hover:bg-gray-300">
                          <span className="flex items-center">
                            {getVisibilityIcon()}
                          </span>
                          <span>{getVisibilityText()}</span>
                          <ChevronDown className="h-3 w-3" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48">
                        <DropdownMenuGroup>
                          <DropdownMenuItem 
                            onClick={() => setVisibility('public')}
                            className="flex items-center cursor-pointer"
                          >
                            <Globe className="h-4 w-4 mr-2" />
                            <span>Public</span>
                            {visibility === 'public' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"></div>}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setVisibility('friends')}
                            className="flex items-center cursor-pointer"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            <span>Friends</span>
                            {visibility === 'friends' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"></div>}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setVisibility('private')}
                            className="flex items-center cursor-pointer"
                          >
                            <Lock className="h-4 w-4 mr-2" />
                            <span>Only me</span>
                            {visibility === 'private' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"></div>}
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <Textarea
                  placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`}
                  className="w-full border-none outline-none resize-none text-lg"
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                
                {imageUrl && (
                  <div className="mt-2 relative">
                    <img src={imageUrl} alt="Post preview" className="w-full rounded-lg" />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setImageUrl("")}
                    >
                      Remove
                    </Button>
                  </div>
                )}
                
                {!imageUrl && (
                  <div className="bg-gray-100 rounded-lg p-3 mb-3 cursor-pointer border border-dashed border-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <Image className="h-6 w-6 text-gray-500 mx-auto mb-1" />
                      <p className="text-sm">Add Photos or Videos</p>
                    </div>
                  </div>
                )}
                
                <div className="border rounded-lg p-2 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Add to your post</span>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full hover:bg-gray-200">
                        <Image className="h-5 w-5 text-green-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full hover:bg-gray-200">
                        <span className="text-blue-500">👤</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full hover:bg-gray-200">
                        <SmilePlus className="h-5 w-5 text-yellow-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full hover:bg-gray-200">
                        <span className="text-red-500">📍</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full hover:bg-gray-200">
                        <span>⋯</span>
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Image URL (optional)"
                    className="flex-1"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <Button
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={createPostMutation.isPending || (!content.trim() && !imageUrl.trim())}
                  >
                    {createPostMutation.isPending ? "Posting..." : "Post"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="border-t mt-3 pt-2">
          <div className="flex justify-between">
            <Button
              variant="ghost" 
              className="flex items-center justify-center space-x-1 p-2 rounded-lg hover:bg-gray-100 flex-1"
              onClick={() => setOpen(true)}
            >
              <Video className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-gray-600">Live video</span>
            </Button>
            
            <Button
              variant="ghost" 
              className="flex items-center justify-center space-x-1 p-2 rounded-lg hover:bg-gray-100 flex-1"
              onClick={() => setOpen(true)}
            >
              <Image className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Photo/video</span>
            </Button>
            
            <Button
              variant="ghost" 
              className="flex items-center justify-center space-x-1 p-2 rounded-lg hover:bg-gray-100 flex-1"
              onClick={() => setOpen(true)}
            >
              <SmilePlus className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-600">Feeling/activity</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
