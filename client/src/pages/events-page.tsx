import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Filter,
  ChevronRight,
  Plus,
  Search,
  Star,
  Share2,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";

// Types for events
type Event = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  attendees: number;
  isOnline: boolean;
  isGoing: boolean;
  isInterested: boolean;
  isFeatured?: boolean;
};

// Mock data - would come from an API in a real application
const events: Event[] = [
  {
    id: 1,
    title: "Tech Conference 2023",
    description: "Join us for the biggest tech conference of the year featuring speakers from leading tech companies.",
    imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    date: "June 15-17, 2023",
    time: "9:00 AM - 6:00 PM",
    location: "Convention Center, New York",
    organizer: "TechEvents Inc.",
    attendees: 1250,
    isOnline: false,
    isGoing: true,
    isInterested: false,
    isFeatured: true
  },
  {
    id: 2,
    title: "Web Development Workshop",
    description: "Learn the latest web development techniques and frameworks in this hands-on workshop.",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    date: "May 30, 2023",
    time: "10:00 AM - 3:00 PM",
    location: "Online",
    organizer: "WebDev Academy",
    attendees: 450,
    isOnline: true,
    isGoing: false,
    isInterested: true
  },
  {
    id: 3,
    title: "Networking Mixer",
    description: "Expand your professional network at this casual networking event with professionals from various industries.",
    imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    date: "June 5, 2023",
    time: "6:00 PM - 9:00 PM",
    location: "Downtown Lounge, Chicago",
    organizer: "Business Network Group",
    attendees: 120,
    isOnline: false,
    isGoing: false,
    isInterested: false
  },
  {
    id: 4,
    title: "Charity Fun Run",
    description: "Join us for a 5K fun run to raise funds for children's education. All proceeds go to educational charities.",
    imageUrl: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1053&q=80",
    date: "June 18, 2023",
    time: "8:00 AM - 11:00 AM",
    location: "Central Park, New York",
    organizer: "Education for All Foundation",
    attendees: 567,
    isOnline: false,
    isGoing: true,
    isInterested: false
  },
  {
    id: 5,
    title: "Digital Marketing Webinar",
    description: "Learn strategies to boost your online presence and reach more customers through digital marketing.",
    imageUrl: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1053&q=80",
    date: "June 10, 2023",
    time: "1:00 PM - 3:00 PM",
    location: "Online",
    organizer: "Marketing Pros",
    attendees: 780,
    isOnline: true,
    isGoing: false,
    isInterested: true
  },
  {
    id: 6,
    title: "Art Exhibition Opening",
    description: "Experience the stunning works of contemporary artists at this exclusive exhibition opening night.",
    imageUrl: "https://images.unsplash.com/photo-1594569686666-f361e318c3d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    date: "June 12, 2023",
    time: "7:00 PM - 10:00 PM",
    location: "Modern Art Gallery, San Francisco",
    organizer: "Arts Council",
    attendees: 230,
    isOnline: false,
    isGoing: false,
    isInterested: true,
    isFeatured: true
  }
];

// Event categories
const categories = [
  { id: 1, name: "All Events", count: 45 },
  { id: 2, name: "Going", count: 12 },
  { id: 3, name: "Interested", count: 18 },
  { id: 4, name: "Online Events", count: 24 },
  { id: 5, name: "Past Events", count: 72 },
  { id: 6, name: "Hosted", count: 3 }
];

export default function EventsPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(1);
  
  const getEventsByCategory = (categoryId: number) => {
    switch(categoryId) {
      case 2: // Going
        return events.filter(event => event.isGoing);
      case 3: // Interested
        return events.filter(event => event.isInterested);
      case 4: // Online Events
        return events.filter(event => event.isOnline);
      default:
        return events;
    }
  };
  
  const displayedEvents = getEventsByCategory(selectedCategory);
  const featuredEvents = events.filter(event => event.isFeatured);
  
  return (
    <Layout>
      <div className="container mx-auto py-6 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Events</h1>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left sidebar - categories */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Your Events</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="relative mb-4">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search events" className="pl-8" />
                </div>
                
                <ul className="space-y-1 pt-2">
                  {categories.map(category => (
                    <li key={category.id}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${selectedCategory === category.id ? 'bg-primary/10 text-primary font-medium' : ''}`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <span>{category.name}</span>
                        <span className="ml-auto bg-muted text-muted-foreground rounded-full px-2 py-0 text-xs">
                          {category.count}
                        </span>
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  Calendar View
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Friends' Events</CardTitle>
                <CardDescription>Events your friends are attending</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-medium">Summer Music Festival</p>
                      <p className="text-xs text-muted-foreground">3 of your friends are going</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-medium">Local Farmers Market</p>
                      <p className="text-xs text-muted-foreground">5 of your friends are interested</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main content - events */}
          <div className="md:col-span-3">
            <Tabs defaultValue="upcoming" className="mb-6">
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="this-week">This Week</TabsTrigger>
                <TabsTrigger value="this-month">This Month</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Featured events */}
            {featuredEvents.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Star className="mr-2 h-4 w-4 text-yellow-500" />
                  Featured Events
                </h2>
                
                <div className="grid grid-cols-1 gap-4">
                  {featuredEvents.map(event => (
                    <Card key={event.id} className="overflow-hidden">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-1/3 h-48 sm:h-auto relative">
                          <img 
                            src={event.imageUrl} 
                            alt={event.title} 
                            className="w-full h-full object-cover"
                          />
                          {event.isOnline && (
                            <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                              Online
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col flex-grow p-4">
                          <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                          
                          <div className="flex flex-col space-y-1 mb-4">
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{event.date} • {event.time}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{event.attendees} attending • Organized by {event.organizer}</span>
                            </div>
                          </div>
                          
                          <div className="mt-auto flex flex-wrap gap-2">
                            <Button variant={event.isGoing ? "default" : "outline"} className="flex-1">
                              {event.isGoing ? "Going" : "Going"}
                            </Button>
                            <Button variant={event.isInterested ? "default" : "outline"} className="flex-1">
                              {event.isInterested ? "Interested" : "Interested"}
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Bookmark className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* All events */}
            <h2 className="text-xl font-semibold mb-4">
              {selectedCategory === 1 ? "All Events" : categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayedEvents.filter(event => !event.isFeatured).map(event => (
                <Card key={event.id} className="overflow-hidden h-full flex flex-col">
                  <div className="relative h-40">
                    <img 
                      src={event.imageUrl} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                    />
                    {event.isOnline && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Online
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-black/30 text-white hover:bg-black/50">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="flex-grow pt-4">
                    <h3 className="font-semibold line-clamp-1 mb-1">{event.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{event.description}</p>
                    
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-0 border-t">
                    <div className="flex w-full gap-2">
                      <Button variant={event.isGoing ? "default" : "outline"} size="sm" className="flex-1">
                        {event.isGoing ? "Going" : "Going"}
                      </Button>
                      <Button variant={event.isInterested ? "default" : "outline"} size="sm" className="flex-1">
                        {event.isInterested ? "Interested" : "Interested"}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}