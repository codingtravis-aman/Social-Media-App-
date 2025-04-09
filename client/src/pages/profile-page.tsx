import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { PostCard } from "@/components/post/post-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, UserPlus, UserCheck, Settings, Image, Grid, Bookmark, Clock } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ProfilePictureUpload } from "@/components/profile/profile-picture-upload";

export default function ProfilePage() {
  const { id } = useParams();
  const userId = parseInt(id);
  const { user: currentUser } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [coverPicture, setCoverPicture] = useState("");
  
  const isCurrentUser = currentUser?.id === userId;
  
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
    onSuccess: (data) => {
      setName(data.name || "");
      setBio(data.bio || "");
      setProfilePicture(data.profilePicture || "");
      setCoverPicture(data.coverPicture || "");
    },
  });
  
  const { data: posts = [], isLoading: isLoadingPosts } = useQuery({
    queryKey: [`/api/users/${userId}/posts`],
    enabled: !!userId,
  });
  
  const { data: friendship } = useQuery({
    queryKey: [`/api/friends`],
    enabled: !!currentUser && !isCurrentUser,
    select: (data) => data.find((f: any) => 
      (f.requesterId === currentUser?.id && f.addresseeId === userId) || 
      (f.requesterId === userId && f.addresseeId === currentUser?.id)
    ),
  });
  
  const friendRequestMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/friends/request", { addresseeId: userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      toast({
        title: "Friend request sent",
        description: `You sent a friend request to ${user.name}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error sending friend request",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });
  
  const acceptFriendRequestMutation = useMutation({
    mutationFn: async () => {
      if (!friendship) return;
      await apiRequest("PUT", `/api/friends/${friendship.id}/accept`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      toast({
        title: "Friend request accepted",
        description: `You are now friends with ${user.name}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error accepting friend request",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });
  
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", `/api/users/${currentUser?.id}`, {
        name,
        bio,
        profilePicture,
        coverPicture,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating profile",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });
  
  if (isLoadingUser) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }
  
  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-16 flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
          <p className="text-gray-500 mb-4">The user you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </>
    );
  }
  
  const renderFriendButton = () => {
    if (isCurrentUser) return null;
    
    if (!friendship) {
      return (
        <Button 
          onClick={() => friendRequestMutation.mutate()}
          disabled={friendRequestMutation.isPending}
          className="flex items-center gap-2"
        >
          {friendRequestMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          Add Friend
        </Button>
      );
    }
    
    if (friendship.status === "pending") {
      if (friendship.addresseeId === currentUser?.id) {
        return (
          <Button 
            onClick={() => acceptFriendRequestMutation.mutate()}
            disabled={acceptFriendRequestMutation.isPending}
            className="flex items-center gap-2"
          >
            {acceptFriendRequestMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserCheck className="h-4 w-4" />
            )}
            Accept Request
          </Button>
        );
      } else {
        return (
          <Button variant="secondary" disabled className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Request Sent
          </Button>
        );
      }
    }
    
    if (friendship.status === "accepted") {
      return (
        <Button variant="secondary" className="flex items-center gap-2">
          <UserCheck className="h-4 w-4" />
          Friends
        </Button>
      );
    }
    
    return null;
  };
  
  return (
    <>
      <Navbar />
      
      <main className="pt-16 pb-16 bg-gray-100">
        <div className="bg-white shadow-sm">
          {/* Cover Photo */}
          <div className="relative h-64 bg-gray-200">
            {user.coverPicture && (
              <img 
                src={user.coverPicture} 
                alt="Cover" 
                className="w-full h-full object-cover" 
              />
            )}
            
            {/* Profile Picture and Name */}
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
              <Avatar className="w-32 h-32 border-4 border-white">
                <AvatarImage src={user.profilePicture} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
          
          {/* Profile Info */}
          <div className="pt-20 pb-4 px-4 text-center max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
            {user.bio && <p className="text-gray-600 mb-4">{user.bio}</p>}
            
            <div className="flex justify-center gap-2 mt-4">
              {isCurrentUser ? (
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right">Name</label>
                        <Input 
                          className="col-span-3" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right">Bio</label>
                        <Textarea 
                          className="col-span-3" 
                          value={bio} 
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell us about yourself" 
                          rows={3}
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right">Profile Picture</label>
                        <div className="col-span-3">
                          <ProfilePictureUpload />
                          <p className="text-xs text-muted-foreground mt-2">
                            Click the button above to upload a profile picture directly
                          </p>
                          <div className="mt-2">
                            <label className="text-xs text-muted-foreground block mb-1">
                              Or enter an image URL:
                            </label>
                            <Input 
                              value={profilePicture} 
                              onChange={(e) => setProfilePicture(e.target.value)}
                              placeholder="Image URL" 
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right">Cover Picture</label>
                        <Input 
                          className="col-span-3" 
                          value={coverPicture} 
                          onChange={(e) => setCoverPicture(e.target.value)}
                          placeholder="Image URL" 
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => updateProfileMutation.mutate()}
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                renderFriendButton()
              )}
            </div>
          </div>
          
          {/* Profile Tabs */}
          <div className="border-t">
            <div className="max-w-4xl mx-auto">
              <Tabs defaultValue="posts">
                <TabsList className="flex justify-center border-b border-gray-200">
                  <TabsTrigger value="posts" className="px-8 py-4">
                    Posts
                  </TabsTrigger>
                  <TabsTrigger value="about" className="px-8 py-4">
                    About
                  </TabsTrigger>
                  <TabsTrigger value="photos" className="px-8 py-4">
                    Photos
                  </TabsTrigger>
                  <TabsTrigger value="friends" className="px-8 py-4">
                    Friends
                  </TabsTrigger>
                </TabsList>
                
                <div className="p-4">
                  <TabsContent value="posts">
                    {isLoadingPosts ? (
                      <div className="flex justify-center my-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        {posts.length > 0 ? (
                          <div className="space-y-4">
                            {posts.map((post: any) => (
                              <PostCard key={post.id} post={post} />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Image className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-medium mb-2">No Posts Yet</h3>
                            <p className="text-gray-500">
                              {isCurrentUser
                                ? "When you create posts, they'll appear here."
                                : `${user.name} hasn't posted anything yet.`}
                            </p>
                            {isCurrentUser && (
                              <Button className="mt-4" onClick={() => navigate("/")}>
                                Create Your First Post
                              </Button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="about">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Grid className="h-5 w-5 text-primary" />
                        About {user.name}
                      </h3>
                      
                      {user.bio ? (
                        <p className="text-gray-700">{user.bio}</p>
                      ) : (
                        <p className="text-gray-500 italic">
                          {isCurrentUser
                            ? "Add a bio to tell people more about yourself."
                            : `${user.name} hasn't added a bio yet.`}
                        </p>
                      )}
                      
                      {isCurrentUser && !user.bio && (
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => setIsEditing(true)}
                        >
                          Add Bio
                        </Button>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="photos">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Image className="h-5 w-5 text-primary" />
                        Photos
                      </h3>
                      
                      {posts.some((post: any) => post.image) ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {posts
                            .filter((post: any) => post.image)
                            .map((post: any) => (
                              <div key={post.id} className="aspect-square rounded-md overflow-hidden">
                                <img 
                                  src={post.image} 
                                  alt="Post" 
                                  className="w-full h-full object-cover hover:opacity-90 transition cursor-pointer" 
                                  onClick={() => navigate(`/posts/${post.id}`)}
                                />
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Image className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">
                            {isCurrentUser
                              ? "When you share photos, they'll appear here."
                              : `${user.name} hasn't shared any photos yet.`}
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="friends">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-primary" />
                        Friends
                      </h3>
                      
                      <div className="text-center py-8">
                        <UserCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">
                          Friend list feature coming soon!
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
