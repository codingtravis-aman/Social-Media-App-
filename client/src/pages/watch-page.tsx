import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { ReelCard } from "@/components/reels/reel-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, Upload, Clock, Bookmark, Users, Filter,
  TrendingUp, Award, PlayCircle, Loader2
} from "lucide-react";

export default function WatchPage() {
  const [, setLocation] = useLocation();
  
  const { data: reels = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/reels"],
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
                  <h1 className="text-2xl font-bold">Watch</h1>
                  <p className="text-gray-600">Videos and reels from your favorite creators</p>
                </div>
                
                <div className="p-4 border-b">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search videos and reels"
                      className="pl-10 pr-4 py-2 w-full"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                
                <Tabs defaultValue="featured" className="w-full">
                  <div className="border-b">
                    <TabsList className="flex justify-start p-0 h-auto bg-transparent">
                      <TabsTrigger 
                        value="featured" 
                        className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none data-[state=active]:bg-transparent"
                      >
                        Featured
                      </TabsTrigger>
                      <TabsTrigger 
                        value="live" 
                        className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none data-[state=active]:bg-transparent"
                      >
                        Live
                      </TabsTrigger>
                      <TabsTrigger 
                        value="following" 
                        className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none data-[state=active]:bg-transparent"
                      >
                        Following
                      </TabsTrigger>
                      <TabsTrigger 
                        value="saved" 
                        className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none data-[state=active]:bg-transparent"
                      >
                        Saved
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="featured" className="p-4 mt-0">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg">Trending Reels</h3>
                      <div className="flex gap-2">
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex items-center gap-1"
                          onClick={() => setLocation("/reels-view")}
                        >
                          <PlayCircle className="h-4 w-4" />
                          <span>View Full Screen</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-1">
                          <Filter className="h-4 w-4" />
                          <span>Filter</span>
                        </Button>
                      </div>
                    </div>
                    
                    {isLoading ? (
                      <div className="flex justify-center my-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {reels.map((reel) => (
                          <div className="flex-grow" key={reel.id}>
                            <ReelCard reel={reel} />
                          </div>
                        ))}
                        
                        {reels.length === 0 && (
                          <div className="col-span-full text-center py-12">
                            <PlayCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                            <h3 className="text-lg font-medium mb-1">No reels found</h3>
                            <p className="text-gray-500">Be the first to create a reel!</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-8">
                      <h3 className="font-semibold text-lg mb-4">Popular Channels</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((item) => (
                          <div 
                            key={item} 
                            className="rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                          >
                            <div className="flex items-start p-4">
                              <div className="h-14 w-14 rounded bg-primary flex items-center justify-center text-white text-xl font-bold mr-3">
                                {item === 1 && <TrendingUp className="h-6 w-6" />}
                                {item === 2 && <Users className="h-6 w-6" />}
                                {item === 3 && <Award className="h-6 w-6" />}
                                {item === 4 && <Clock className="h-6 w-6" />}
                              </div>
                              <div>
                                <h4 className="font-medium">
                                  {item === 1 && "Trending Now"}
                                  {item === 2 && "Creator Spotlight"}
                                  {item === 3 && "Award Winners"}
                                  {item === 4 && "Recently Watched"}
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">
                                  {item === 1 && "Popular videos from today"}
                                  {item === 2 && "Top creators this week"}
                                  {item === 3 && "Community favorites"}
                                  {item === 4 && "Continue watching"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="live" className="p-4 mt-0">
                    <div className="text-center py-12">
                      <PlayCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium mb-1">No live videos at the moment</h3>
                      <p className="text-gray-500 mb-4">Check back later or go live yourself!</p>
                      <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Go Live
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="following" className="p-4 mt-0">
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium mb-1">Follow creators to see their content</h3>
                      <p className="text-gray-500 mb-4">Videos from people you follow will appear here</p>
                      <Button variant="outline">Find Creators</Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="saved" className="p-4 mt-0">
                    <div className="text-center py-12">
                      <Bookmark className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium mb-1">No saved videos yet</h3>
                      <p className="text-gray-500 mb-4">Save videos to watch them later</p>
                      <Button variant="outline">Browse Videos</Button>
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