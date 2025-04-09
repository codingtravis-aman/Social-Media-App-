import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  UserPlus, 
  Users, 
  Search, 
  Settings, 
  UserCheck, 
  MessageSquare,
  UserX,
  BellRing,
  Video,
  UserMinus
} from "lucide-react";

// Types for friends
type Friend = {
  id: number;
  name: string;
  username: string;
  avatarUrl: string;
  mutualFriends: number;
  isOnline: boolean;
  lastActive?: string;
};

type FriendRequest = {
  id: number;
  name: string;
  username: string;
  avatarUrl: string;
  mutualFriends: number;
  requestDate: string;
};

type Suggestion = {
  id: number;
  name: string;
  username: string;
  avatarUrl: string;
  mutualFriends: number;
  reason: string;
};

// Mock data - would come from an API in a real application
const friends: Friend[] = [
  {
    id: 1,
    name: "John Smith",
    username: "johnsmith",
    avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg",
    mutualFriends: 12,
    isOnline: true
  },
  {
    id: 2,
    name: "Emma Wilson",
    username: "emmaw",
    avatarUrl: "https://randomuser.me/api/portraits/women/2.jpg",
    mutualFriends: 8,
    isOnline: true
  },
  {
    id: 3,
    name: "Michael Brown",
    username: "michaelb",
    avatarUrl: "https://randomuser.me/api/portraits/men/3.jpg",
    mutualFriends: 15,
    isOnline: false,
    lastActive: "2 hours ago"
  },
  {
    id: 4,
    name: "Sophia Garcia",
    username: "sophiag",
    avatarUrl: "https://randomuser.me/api/portraits/women/4.jpg",
    mutualFriends: 5,
    isOnline: false,
    lastActive: "1 day ago"
  },
  {
    id: 5,
    name: "David Miller",
    username: "davidm",
    avatarUrl: "https://randomuser.me/api/portraits/men/5.jpg",
    mutualFriends: 20,
    isOnline: true
  },
  {
    id: 6,
    name: "Olivia Taylor",
    username: "oliviat",
    avatarUrl: "https://randomuser.me/api/portraits/women/6.jpg",
    mutualFriends: 3,
    isOnline: false,
    lastActive: "3 days ago"
  },
  {
    id: 7,
    name: "James Johnson",
    username: "jamesj",
    avatarUrl: "https://randomuser.me/api/portraits/men/7.jpg",
    mutualFriends: 7,
    isOnline: true
  },
  {
    id: 8,
    name: "Isabella Martinez",
    username: "isabellam",
    avatarUrl: "https://randomuser.me/api/portraits/women/8.jpg",
    mutualFriends: 10,
    isOnline: false,
    lastActive: "Just now"
  }
];

const friendRequests: FriendRequest[] = [
  {
    id: 101,
    name: "Alex Turner",
    username: "alext",
    avatarUrl: "https://randomuser.me/api/portraits/men/11.jpg",
    mutualFriends: 4,
    requestDate: "2 days ago"
  },
  {
    id: 102,
    name: "Mia Williams",
    username: "miaw",
    avatarUrl: "https://randomuser.me/api/portraits/women/12.jpg",
    mutualFriends: 8,
    requestDate: "1 week ago"
  },
  {
    id: 103,
    name: "Daniel Lee",
    username: "daniell",
    avatarUrl: "https://randomuser.me/api/portraits/men/13.jpg",
    mutualFriends: 2,
    requestDate: "3 days ago"
  }
];

const suggestions: Suggestion[] = [
  {
    id: 201,
    name: "Jake Roberts",
    username: "jaker",
    avatarUrl: "https://randomuser.me/api/portraits/men/21.jpg",
    mutualFriends: 15,
    reason: "Based on your mutual friends"
  },
  {
    id: 202,
    name: "Lily Chen",
    username: "lilyc",
    avatarUrl: "https://randomuser.me/api/portraits/women/22.jpg",
    mutualFriends: 7,
    reason: "From your work group"
  },
  {
    id: 203,
    name: "Samuel Jackson",
    username: "samuelj",
    avatarUrl: "https://randomuser.me/api/portraits/men/23.jpg",
    mutualFriends: 9,
    reason: "From your hometown"
  },
  {
    id: 204,
    name: "Grace Kim",
    username: "gracek",
    avatarUrl: "https://randomuser.me/api/portraits/women/24.jpg",
    mutualFriends: 5,
    reason: "From your school"
  }
];

// Friend lists categories
const friendCategories = [
  { id: 1, name: "All Friends", count: friends.length, icon: <Users /> },
  { id: 2, name: "Recently Active", count: 6, icon: <User /> },
  { id: 3, name: "Close Friends", count: 4, icon: <UserCheck /> },
  { id: 4, name: "Acquaintances", count: 12, icon: <UserPlus /> },
  { id: 5, name: "Restricted", count: 2, icon: <UserX /> },
];

export default function FriendsPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <Layout>
      <div className="container mx-auto py-6 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Friends</h1>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Find Friends
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left sidebar - friend categories */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Friends</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="relative mb-4">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search friends" 
                    className="pl-8" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <ul className="space-y-1 pt-2">
                  {friendCategories.map(category => (
                    <li key={category.id}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${selectedCategory === category.id ? 'bg-primary/10 text-primary font-medium' : ''}`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <span className="mr-2">{category.icon}</span>
                        <span>{category.name}</span>
                        <span className="ml-auto bg-muted text-muted-foreground rounded-full px-2 py-0 text-xs">
                          {category.count}
                        </span>
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Friend Requests</CardTitle>
                <CardDescription>{friendRequests.length} pending requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {friendRequests.slice(0, 2).map(request => (
                    <div key={request.id} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={request.avatarUrl} alt={request.name} />
                        <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <p className="text-sm font-medium">{request.name}</p>
                        <p className="text-xs text-muted-foreground">{request.mutualFriends} mutual friends</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="w-full" onClick={() => setSelectedCategory(6)}>
                  See all requests
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Main content - friends list */}
          <div className="md:col-span-3">
            <Tabs defaultValue="all" className="mb-6">
              <TabsList>
                <TabsTrigger value="all">All Friends</TabsTrigger>
                <TabsTrigger value="requests">Requests</TabsTrigger>
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                <TabsTrigger value="birthdays">Birthdays</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFriends.map(friend => (
                    <Card key={friend.id} className="overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-start">
                          <div className="relative mr-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={friend.avatarUrl} alt={friend.name} />
                              <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {friend.isOnline && (
                              <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-semibold text-lg">{friend.name}</h3>
                            <p className="text-sm text-muted-foreground mb-1">@{friend.username}</p>
                            <p className="text-xs text-muted-foreground">{friend.mutualFriends} mutual friends</p>
                            {!friend.isOnline && friend.lastActive && (
                              <p className="text-xs text-muted-foreground">Active {friend.lastActive}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                          
                          <Button variant="ghost" size="sm">
                            <UserCheck className="h-4 w-4" />
                          </Button>
                          
                          <Button variant="ghost" size="sm">
                            <Video className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="requests" className="pt-4">
                <h2 className="text-xl font-semibold mb-4">Friend Requests</h2>
                
                <div className="space-y-4">
                  {friendRequests.map(request => (
                    <Card key={request.id} className="overflow-hidden">
                      <div className="p-4">
                        <div className="flex flex-wrap items-center">
                          <div className="mr-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={request.avatarUrl} alt={request.name} />
                              <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-grow mb-4 sm:mb-0">
                            <h3 className="font-semibold text-lg">{request.name}</h3>
                            <p className="text-sm text-muted-foreground">@{request.username}</p>
                            <div className="flex items-center mt-1">
                              <Users className="h-3 w-3 text-muted-foreground mr-1" />
                              <span className="text-xs text-muted-foreground">{request.mutualFriends} mutual friends</span>
                              <span className="mx-2 text-muted-foreground">•</span>
                              <BellRing className="h-3 w-3 text-muted-foreground mr-1" />
                              <span className="text-xs text-muted-foreground">Requested {request.requestDate}</span>
                            </div>
                          </div>
                          <div className="w-full sm:w-auto flex space-x-2 mt-2 sm:mt-0">
                            <Button className="flex-1 sm:flex-none">Confirm</Button>
                            <Button variant="outline" className="flex-1 sm:flex-none">Delete</Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="suggestions" className="pt-4">
                <h2 className="text-xl font-semibold mb-4">People You May Know</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestions.map(suggestion => (
                    <Card key={suggestion.id} className="overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-center mb-3">
                          <Avatar className="h-12 w-12 mr-3">
                            <AvatarImage src={suggestion.avatarUrl} alt={suggestion.name} />
                            <AvatarFallback>{suggestion.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{suggestion.name}</h3>
                            <p className="text-xs text-muted-foreground">@{suggestion.username}</p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          <Users className="h-3 w-3 inline mr-1" />
                          {suggestion.mutualFriends} mutual friends
                        </p>
                        
                        <Badge variant="outline" className="mb-3">
                          {suggestion.reason}
                        </Badge>
                        
                        <div className="flex space-x-2 mt-2">
                          <Button size="sm" className="flex-1">
                            <UserPlus className="h-4 w-4 mr-1" />
                            Add Friend
                          </Button>
                          <Button variant="ghost" size="sm">
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="birthdays" className="pt-4">
                <h2 className="text-xl font-semibold mb-4">Upcoming Birthdays</h2>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="relative mr-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src="https://randomuser.me/api/portraits/women/32.jpg" alt="Jessica Lee" />
                            <AvatarFallback>JL</AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <h3 className="font-semibold">Jessica Lee</h3>
                          <p className="text-sm text-muted-foreground">Birthday today</p>
                        </div>
                        <Button className="ml-auto" size="sm">Send Wish</Button>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="relative mr-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src="https://randomuser.me/api/portraits/men/42.jpg" alt="Chris Taylor" />
                            <AvatarFallback>CT</AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <h3 className="font-semibold">Chris Taylor</h3>
                          <p className="text-sm text-muted-foreground">Birthday tomorrow</p>
                        </div>
                        <Button className="ml-auto" size="sm">Send Wish</Button>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="relative mr-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src="https://randomuser.me/api/portraits/women/42.jpg" alt="Samantha Wilson" />
                            <AvatarFallback>SW</AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <h3 className="font-semibold">Samantha Wilson</h3>
                          <p className="text-sm text-muted-foreground">Birthday in 3 days</p>
                        </div>
                        <Button className="ml-auto" size="sm">Send Wish</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}