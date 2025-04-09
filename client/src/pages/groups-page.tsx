import React, { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Plus, Users, Calendar, Settings, Compass, 
  Bell, MessageSquare, Grid, Clock, ChevronRight,
  Loader2, UserPlus, Globe, Lock
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Demo groups
const suggestedGroups = [
  {
    id: 1,
    name: "Photography Enthusiasts",
    description: "Share your best photos and techniques with fellow photographers",
    coverImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=2000&ixlib=rb-4.0.3",
    members: 12453,
    postsPerDay: 35,
    privacy: "public"
  },
  {
    id: 2,
    name: "Hiking Adventures",
    description: "Find hiking buddies and share your outdoor experiences",
    coverImage: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
    members: 8732,
    postsPerDay: 28,
    privacy: "public"
  },
  {
    id: 3,
    name: "Healthy Recipes",
    description: "Exchange delicious and healthy recipes",
    coverImage: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
    members: 21098,
    postsPerDay: 52,
    privacy: "public"
  },
  {
    id: 4,
    name: "Web Developers",
    description: "Connect with other developers and share programming tips",
    coverImage: "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
    members: 15634,
    postsPerDay: 45,
    privacy: "public"
  }
];

export default function GroupsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { data: userGroups = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/groups/user"],
    enabled: false, // We're not making this API call until there's a real endpoint
  });
  
  return (
    <>
      <Navbar />
      
      <main className="pt-16 md:pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex">
            <LeftSidebar />
            
            <div className="w-full lg:w-1/2 lg:ml-[25%] pt-4 pb-8">
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-2xl font-bold">Groups</h1>
                      <p className="text-gray-600">Connect with people who share your interests</p>
                    </div>
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Group
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Create New Group</DialogTitle>
                          <DialogDescription>
                            Fill in the details to create your new group
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="name">Group Name</Label>
                            <Input id="name" placeholder="Enter group name" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea 
                              id="description" 
                              placeholder="What's your group about?" 
                              className="resize-none"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="privacy">Privacy</Label>
                            <Select defaultValue="public">
                              <SelectTrigger id="privacy">
                                <SelectValue placeholder="Select privacy" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="public">
                                  <div className="flex items-center">
                                    <Globe className="h-4 w-4 mr-2" />
                                    <span>Public</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="private">
                                  <div className="flex items-center">
                                    <Lock className="h-4 w-4 mr-2" />
                                    <span>Private</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="cover">Cover Image URL</Label>
                            <Input 
                              id="cover" 
                              type="url" 
                              placeholder="https://example.com/image.jpg" 
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" onClick={() => setCreateDialogOpen(false)}>
                            Create Group
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                <div className="p-4 border-b">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search groups"
                      className="pl-10 pr-4 py-2 w-full"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                
                <Tabs defaultValue="yours" className="w-full">
                  <div className="border-b">
                    <TabsList className="flex justify-start p-0 h-auto bg-transparent">
                      <TabsTrigger 
                        value="yours" 
                        className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none data-[state=active]:bg-transparent"
                      >
                        Your Groups
                      </TabsTrigger>
                      <TabsTrigger 
                        value="discover" 
                        className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none data-[state=active]:bg-transparent"
                      >
                        Discover Groups
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="yours" className="p-4 mt-0">
                    {isLoading ? (
                      <div className="flex justify-center my-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : userGroups.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userGroups.map((group) => (
                          <Card key={group.id} className="overflow-hidden">
                            <div className="h-32 overflow-hidden">
                              <img 
                                src={group.coverImage} 
                                alt={group.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-lg">{group.name}</h3>
                              <p className="text-sm text-gray-500 mb-3">{group.description}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center text-xs text-gray-500">
                                  <Users className="h-4 w-4 mr-1" />
                                  <span>{group.members.toLocaleString()} members</span>
                                </div>
                                <Button variant="outline" size="sm">
                                  View
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium mb-1">You don't have any groups yet</h3>
                        <p className="text-gray-500 mb-4">Join existing groups or create your own</p>
                        <div className="flex justify-center gap-3">
                          <Button variant="outline" onClick={() => document.getElementById('discover-tab')?.click()}>
                            <Compass className="h-4 w-4 mr-2" />
                            Discover Groups
                          </Button>
                          <Button onClick={() => setCreateDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Group
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
                      <Card>
                        <CardContent className="p-4">
                          <Button
                            className="w-full h-full flex flex-col items-center justify-center py-5"
                            variant="outline"
                            onClick={() => setCreateDialogOpen(true)}
                          >
                            <Plus className="h-8 w-8 mb-2" />
                            <span className="font-medium">Create New Group</span>
                          </Button>
                        </CardContent>
                      </Card>
                      
                      {/* Quick access cards */}
                      {[
                        { name: "Group Invites", icon: <UserPlus /> },
                        { name: "Group Events", icon: <Calendar /> },
                        { name: "Your Feed", icon: <Grid /> },
                        { name: "Group Messages", icon: <MessageSquare /> },
                        { name: "Notifications", icon: <Bell /> }
                      ].map((item) => (
                        <Card key={item.name}>
                          <CardContent className="p-4">
                            <Button
                              className="w-full h-full flex flex-col items-center justify-center py-5"
                              variant="outline"
                            >
                              {React.cloneElement(item.icon, { className: "h-8 w-8 mb-2" })}
                              <span className="font-medium">{item.name}</span>
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="discover" className="p-4 mt-0" id="discover-tab">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-2">Suggested Groups</h2>
                      <p className="text-gray-600">Groups you might be interested in based on your activity</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {suggestedGroups.map((group) => (
                        <Card key={group.id} className="overflow-hidden">
                          <div className="h-32 overflow-hidden">
                            <img 
                              src={group.coverImage} 
                              alt={group.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg">{group.name}</h3>
                              <div className="flex items-center text-xs bg-gray-100 px-2 py-1 rounded">
                                {group.privacy === "public" ? (
                                  <Globe className="h-3 w-3 mr-1" />
                                ) : (
                                  <Lock className="h-3 w-3 mr-1" />
                                )}
                                <span>{group.privacy}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 mb-3">{group.description}</p>
                            <div className="flex flex-wrap gap-y-2 justify-between mb-3">
                              <div className="flex items-center text-xs text-gray-500">
                                <Users className="h-4 w-4 mr-1" />
                                <span>{group.members.toLocaleString()} members</span>
                              </div>
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{group.postsPerDay} posts/day</span>
                              </div>
                            </div>
                            <Button className="w-full">
                              <UserPlus className="h-4 w-4 mr-2" />
                              Join Group
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="mt-8 text-center">
                      <Button variant="outline" className="w-full">
                        See More Groups
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    
                    <div className="mt-10">
                      <h2 className="text-xl font-semibold mb-6">Browse by Category</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {[
                          "Technology", "Sports", "Music", "Cooking", 
                          "Travel", "Health", "Art", "Education"
                        ].map((category) => (
                          <Button
                            key={category}
                            variant="outline"
                            className="h-auto py-4"
                          >
                            {category}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            
            <RightSidebar />
          </div>
        </div>
      </main>
    </>
  );
}