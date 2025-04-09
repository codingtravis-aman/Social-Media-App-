import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, TrendingUp, Zap, Award, ThumbsUp, ArrowRight,
  UserPlus, Video, MonitorPlay, Gamepad2, Joystick, Headphones,
  Puzzle, Rocket, Loader2, ChevronRight, SquareUser, Users
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

// Demo featured games
const featuredGames = [
  {
    id: 1,
    title: "Fortnite",
    image: "https://images.unsplash.com/photo-1589241687576-ac3682d11da4?auto=format&fit=crop&q=80&w=1974&ixlib=rb-4.0.3",
    genre: "Battle Royale",
    players: "2.8M",
    rating: 4.5,
  },
  {
    id: 2,
    title: "Minecraft",
    image: "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&q=80&w=1740&ixlib=rb-4.0.3",
    genre: "Sandbox",
    players: "3.2M",
    rating: 4.8,
  },
  {
    id: 3,
    title: "Call of Duty: Warzone",
    image: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
    genre: "FPS",
    players: "1.9M",
    rating: 4.2,
  },
  {
    id: 4,
    title: "League of Legends",
    image: "https://images.unsplash.com/photo-1640550111763-93b2d4d7a288?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
    genre: "MOBA",
    players: "2.5M",
    rating: 4.3,
  },
  {
    id: 5,
    title: "Among Us",
    image: "https://images.unsplash.com/photo-1607854962423-bd927cb2150e?auto=format&fit=crop&q=80&w=1932&ixlib=rb-4.0.3",
    genre: "Party",
    players: "1.2M",
    rating: 4.4,
  }
];

// Demo live streamers
const liveStreamers = [
  {
    id: 1,
    name: "GamerPro",
    avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=1974&ixlib=rb-4.0.3",
    game: "Fortnite",
    viewers: "32.5K",
    isLive: true
  },
  {
    id: 2,
    name: "MegaGamerX",
    avatar: "https://images.unsplash.com/photo-1557555187-23d685287bc3?auto=format&fit=crop&q=80&w=1964&ixlib=rb-4.0.3",
    game: "Call of Duty",
    viewers: "18.9K",
    isLive: true
  },
  {
    id: 3,
    name: "StrategyMaster",
    avatar: "https://images.unsplash.com/photo-1629411949133-32dea0509248?auto=format&fit=crop&q=80&w=2000&ixlib=rb-4.0.3",
    game: "League of Legends",
    viewers: "25.2K",
    isLive: true
  },
  {
    id: 4,
    name: "CasualGamer",
    avatar: "https://images.unsplash.com/photo-1542144612-1b3641ec3459?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
    game: "Minecraft",
    viewers: "12.7K",
    isLive: true
  }
];

// Demo online friends
const onlineFriends = [
  {
    id: 1,
    name: "Alex Johnson",
    avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=1780&ixlib=rb-4.0.3",
    game: "Fortnite",
    status: "In Match"
  },
  {
    id: 2,
    name: "Samantha Lee",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
    game: "Minecraft",
    status: "Building"
  },
  {
    id: 3,
    name: "Mike Roberts",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1974&ixlib=rb-4.0.3",
    game: "Online",
    status: "Available"
  }
];

// Demo achievements
const recentAchievements = [
  {
    game: "Fortnite",
    achievement: "Victory Royale",
    description: "Win a Battle Royale match",
    icon: <Award className="h-8 w-8 text-yellow-400" />,
    date: "Today"
  },
  {
    game: "Minecraft",
    achievement: "Master Builder",
    description: "Create a structure with 1000+ blocks",
    icon: <Puzzle className="h-8 w-8 text-green-500" />,
    date: "Yesterday"
  },
  {
    game: "Call of Duty",
    achievement: "Sharpshooter",
    description: "Get 10 headshots in a single match",
    icon: <Zap className="h-8 w-8 text-blue-500" />,
    date: "3 days ago"
  }
];

export default function GamingPage() {
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
                  <h1 className="text-2xl font-bold">Gaming</h1>
                  <p className="text-gray-600">Play, watch, and connect with your gaming community</p>
                </div>
                
                <div className="p-4 border-b">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search games, streams, and players"
                      className="pl-10 pr-4 py-2 w-full"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                
                <Tabs defaultValue="play" className="w-full">
                  <div className="border-b">
                    <TabsList className="flex justify-start p-0 h-auto bg-transparent">
                      <TabsTrigger 
                        value="play" 
                        className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none data-[state=active]:bg-transparent"
                      >
                        Play
                      </TabsTrigger>
                      <TabsTrigger 
                        value="watch" 
                        className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none data-[state=active]:bg-transparent"
                      >
                        Watch
                      </TabsTrigger>
                      <TabsTrigger 
                        value="connect" 
                        className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none data-[state=active]:bg-transparent"
                      >
                        Connect
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="play" className="p-4 mt-0">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                        Featured Games
                      </h2>
                    </div>
                    
                    <ScrollArea className="w-full whitespace-nowrap pb-2">
                      <div className="flex space-x-4">
                        {featuredGames.map((game) => (
                          <Card key={game.id} className="flex-shrink-0 w-60 overflow-hidden">
                            <div className="h-32 overflow-hidden">
                              <img 
                                src={game.image} 
                                alt={game.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-lg">{game.title}</h3>
                              <div className="flex justify-between items-center mt-2">
                                <Badge variant="secondary">{game.genre}</Badge>
                                <div className="flex items-center">
                                  <ThumbsUp className="h-4 w-4 mr-1 text-primary" />
                                  <span className="text-sm">{game.rating}</span>
                                </div>
                              </div>
                              <div className="flex justify-between items-center mt-3">
                                <div className="text-xs text-gray-500">
                                  {game.players} playing
                                </div>
                                <Button size="sm">Play</Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                    
                    <div className="mt-8">
                      <h2 className="text-xl font-semibold mb-4">Categories</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[
                          { name: "Action", icon: <Rocket /> },
                          { name: "Adventure", icon: <Gamepad2 /> },
                          { name: "RPG", icon: <Joystick /> },
                          { name: "Strategy", icon: <Puzzle /> },
                          { name: "Sports", icon: <Gamepad2 /> },
                          { name: "Multiplayer", icon: <UserPlus /> }
                        ].map((category) => (
                          <Button
                            key={category.name}
                            variant="outline"
                            className="h-auto py-6 flex flex-col items-center"
                          >
                            {React.cloneElement(category.icon, { className: "h-8 w-8 mb-2" })}
                            <span>{category.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <h2 className="text-xl font-semibold mb-4">Recent Achievements</h2>
                      <Card>
                        <CardContent className="p-4">
                          {recentAchievements.map((achievement, index) => (
                            <div key={index} className="flex items-start mb-4 last:mb-0">
                              <div className="flex-shrink-0 mr-3">
                                {achievement.icon}
                              </div>
                              <div className="flex-grow">
                                <h4 className="font-medium">{achievement.achievement}</h4>
                                <p className="text-sm text-gray-500">{achievement.description}</p>
                                <div className="flex justify-between items-center mt-1">
                                  <span className="text-xs text-gray-500">{achievement.game}</span>
                                  <span className="text-xs text-gray-500">{achievement.date}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                          <Button variant="outline" className="w-full mt-2">
                            View All Achievements
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="watch" className="p-4 mt-0">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold flex items-center">
                        <Video className="h-5 w-5 mr-2 text-primary" />
                        Live Now
                      </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      {liveStreamers.map((streamer) => (
                        <Card key={streamer.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-center">
                              <Avatar className="h-12 w-12 mr-3">
                                <AvatarImage 
                                  src={streamer.avatar} 
                                  alt={streamer.name} 
                                />
                                <AvatarFallback>{streamer.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold">{streamer.name}</h3>
                                    <p className="text-sm text-gray-500">Playing {streamer.game}</p>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                                    <span className="text-sm">{streamer.viewers}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-3">
                              <Button className="w-full">
                                <MonitorPlay className="h-4 w-4 mr-2" />
                                Watch Stream
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="mb-4">
                      <h2 className="text-xl font-semibold mb-4">Popular Game Clips</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((clip) => (
                          <Card key={clip} className="overflow-hidden">
                            <div className="h-40 relative bg-gray-200">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <MonitorPlay className="h-12 w-12 text-gray-400" />
                              </div>
                              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                2:34
                              </div>
                            </div>
                            <CardContent className="p-3">
                              <h4 className="font-medium text-sm">Amazing Clutch Play</h4>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Call of Duty</span>
                                <span>12K views</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <Button variant="outline" className="w-full mt-4">
                        View More Clips
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="connect" className="p-4 mt-0">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold flex items-center">
                        <SquareUser className="h-5 w-5 mr-2 text-primary" />
                        Friends Online
                      </h2>
                    </div>
                    
                    <Card className="mb-6">
                      <CardContent className="p-4">
                        {onlineFriends.length > 0 ? (
                          <div className="divide-y">
                            {onlineFriends.map((friend) => (
                              <div key={friend.id} className="flex items-center py-3 first:pt-0 last:pb-0">
                                <Avatar className="h-10 w-10 mr-3">
                                  <AvatarImage 
                                    src={friend.avatar} 
                                    alt={friend.name} 
                                  />
                                  <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow">
                                  <h4 className="font-medium">{friend.name}</h4>
                                  <div className="flex items-center text-xs">
                                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                    <span className="text-gray-500">
                                      {friend.status} {friend.game !== "Online" && `• ${friend.game}`}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <Button variant="outline" size="sm">Invite</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <SquareUser className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                            <h3 className="text-lg font-medium mb-1">No friends online</h3>
                            <p className="text-gray-500 mb-4">Invite friends to join your games</p>
                            <Button>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Find Friends
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-4">Gaming Communities</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {["FPS Fanatics", "MOBA Masters", "RPG Guild", "Casual Gamers"].map((community) => (
                          <Card key={community}>
                            <CardContent className="p-4">
                              <h4 className="font-medium">{community}</h4>
                              <div className="flex items-center text-xs text-gray-500 mt-1 mb-3">
                                <Users className="h-3 w-3 mr-1" />
                                <span>{Math.floor(Math.random() * 10000) + 1000} members</span>
                              </div>
                              <Button variant="outline" size="sm" className="w-full">
                                Join Community
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-4">Upcoming Tournaments</h2>
                      <Card>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            {["Fortnite Cup", "League Championship", "COD Tournament"].map((tournament, index) => (
                              <div key={tournament} className="border-b pb-4 last:border-0 last:pb-0">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-medium">{tournament}</h4>
                                  <Badge variant={index === 0 ? "default" : "outline"}>
                                    {index === 0 ? "Today" : `In ${index + 1} days`}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-500 mb-2">
                                  {index === 0 ? "7:00 PM - 10:00 PM" : "Time TBD"}
                                </div>
                                <div className="mb-2">
                                  <Progress value={(100 - index * 30)} className="h-2" />
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>{64 - index * 10} spots left</span>
                                  <span>{Math.floor(Math.random() * 60) + 20} registered</span>
                                </div>
                                <Button className="mt-3 w-full" variant={index === 0 ? "default" : "outline"}>
                                  {index === 0 ? "Register Now" : "Get Notified"}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
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