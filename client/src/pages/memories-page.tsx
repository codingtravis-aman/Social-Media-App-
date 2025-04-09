import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  ChevronLeft,
  ChevronRight,
  Camera,
  Share2,
  Download,
  Heart,
  MessageCircle,
} from "lucide-react";
import { Layout } from "@/components/layout/layout";

type Memory = {
  id: number;
  imageUrl: string;
  date: string;
  year: number;
  caption: string;
  likes: number;
  comments: number;
};

export default function MemoriesPage() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMemory, setCurrentMemory] = useState<number>(0);
  
  // Mock data - in a real application, this would come from an API
  useEffect(() => {
    // This would be fetched from an API based on the selected date
    const mockMemories: Memory[] = [
      {
        id: 1,
        imageUrl: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
        date: "June 12, 2023",
        year: 2023,
        caption: "Amazing day at the beach with friends! 🏖️",
        likes: 42,
        comments: 8,
      },
      {
        id: 2,
        imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
        date: "June 12, 2022",
        year: 2022,
        caption: "Team building activity at work. Great colleagues! 👩‍💻👨‍💻",
        likes: 36,
        comments: 5,
      },
      {
        id: 3,
        imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
        date: "June 12, 2021",
        year: 2021,
        caption: "Celebrating my birthday with the best people in my life! 🎂🎉",
        likes: 65,
        comments: 12,
      },
    ];
    
    setMemories(mockMemories);
  }, [selectedDate]);
  
  const handleNextMemory = () => {
    if (currentMemory < memories.length - 1) {
      setCurrentMemory(currentMemory + 1);
    }
  };
  
  const handlePrevMemory = () => {
    if (currentMemory > 0) {
      setCurrentMemory(currentMemory - 1);
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-6 max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Memories</h1>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Camera className="mr-2 h-4 w-4" />
              Create Memory
            </Button>
            <Button variant="outline" size="sm">
              Settings
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left sidebar - calendar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Select a Date</h2>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Memory Collections</h2>
                <ul className="space-y-3">
                  <li className="flex items-center text-primary font-medium">
                    <span className="bg-primary/10 p-2 rounded-full mr-3">
                      <Camera className="h-4 w-4" />
                    </span>
                    On This Day
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="bg-gray-100 p-2 rounded-full mr-3">
                      <Heart className="h-4 w-4" />
                    </span>
                    Friends
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="bg-gray-100 p-2 rounded-full mr-3">
                      <MessageCircle className="h-4 w-4" />
                    </span>
                    Celebration
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          {/* Main content - memory display */}
          <div className="md:col-span-2">
            {memories.length > 0 ? (
              <Card className="overflow-hidden">
                <div className="relative h-[400px] bg-black">
                  <img 
                    src={memories[currentMemory].imageUrl} 
                    alt="Memory" 
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Navigation controls */}
                  <div className="absolute inset-y-0 left-0 flex items-center">
                    <Button 
                      variant="ghost" 
                      className="h-12 w-12 rounded-full bg-black/30 text-white hover:bg-black/50"
                      onClick={handlePrevMemory}
                      disabled={currentMemory === 0}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                  </div>
                  
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <Button 
                      variant="ghost" 
                      className="h-12 w-12 rounded-full bg-black/30 text-white hover:bg-black/50"
                      onClick={handleNextMemory}
                      disabled={currentMemory === memories.length - 1}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </div>
                  
                  {/* Year badge */}
                  <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {memories[currentMemory].year}
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">{memories[currentMemory].date}</h3>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4 mr-1" /> Share
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-1" /> Download
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{memories[currentMemory].caption}</p>
                  
                  <div className="flex items-center text-gray-500 text-sm">
                    <Button variant="ghost" size="sm" className="text-gray-700">
                      <Heart className="h-4 w-4 mr-1" /> {memories[currentMemory].likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-700">
                      <MessageCircle className="h-4 w-4 mr-1" /> {memories[currentMemory].comments}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="flex flex-col items-center justify-center h-[500px]">
                <Camera className="h-16 w-16 text-gray-300 mb-4" />
                <h2 className="text-2xl font-semibold mb-2">No memories found</h2>
                <p className="text-gray-500 mb-6 text-center">
                  You don't have any memories for this date. Try selecting a different date or create a new memory.
                </p>
                <Button>Create Memory</Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}